/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as fc from 'fast-check'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as yarbitraries from '../arbitraries'
import { blankState } from 'ustaxes/redux/reducer'

import {
  AddDependentForm,
  FilingStatusDropdown,
  SpouseInfo
} from 'ustaxes/components/TaxPayer/SpouseAndDependent'
import { store } from 'ustaxes/redux/store'
import { TestPage } from '../common/Page'
import { ReactElement } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import log from 'ustaxes/core/log'
import YearStatusBar from 'ustaxes/components/YearStatusBar'
import YearStatusBarMethods from '../common/YearsStatusBarMethods'
import { YearsTaxesState } from 'ustaxes/redux'
import {
  DependentMethods,
  FilingStatusMethods,
  SpouseMethods
} from '../common/SpouseAndDependentMethods'
import { FormProvider, useForm } from 'react-hook-form'
import { FilingStatus, filingStatuses } from 'ustaxes/core/data'
import { TaxPayer } from 'ustaxes/core/data'
import { TaxYear, TaxYears } from 'ustaxes/data'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

beforeEach(() => {
  log.setLevel(log.levels.TRACE)
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

jest.setTimeout(10000)

const force = <A,>(a: A | null | undefined): A => {
  if (a === null || a === undefined) {
    throw new Error('Forced but found no value.')
  }
  return a
}

class SpouseTestPage extends TestPage {
  spouse: SpouseMethods

  constructor(state: YearsTaxesState) {
    super(state)
    this.spouse = new SpouseMethods(() =>
      this.rendered().getByTestId('spouse-info')
    )
  }

  component: ReactElement = (
    <Router>
      <div data-testid="spouse-info">
        <SpouseInfo />
      </div>
    </Router>
  )
}

const SpouseAndDependentComponent = (): ReactElement => {
  return (
    <FormProvider {...useForm<{ filingStatus: FilingStatus | '' }>()}>
      <div data-testid="year-status-bar">
        <YearStatusBar />
      </div>
      <div data-testid="spouse-info">
        <SpouseInfo />
      </div>
      <div data-testid="add-dependent-form">
        <AddDependentForm />
      </div>
      <div data-testid="filing-status-dropdown">
        <FilingStatusDropdown />
      </div>
    </FormProvider>
  )
}

class SpouseAndDependentTestPage extends TestPage {
  yearStatus: YearStatusBarMethods
  spouse: SpouseMethods
  dependent: DependentMethods
  filingStatus: FilingStatusMethods

  constructor(state: YearsTaxesState) {
    super(state)

    const testId = (id: string) => (): HTMLElement =>
      this.rendered().getByTestId(id)

    this.yearStatus = new YearStatusBarMethods(testId('year-status-bar'))
    this.spouse = new SpouseMethods(testId('spouse-info'))
    this.dependent = new DependentMethods(testId('add-dependent-form'))
    this.filingStatus = new FilingStatusMethods(
      testId('filing-status-dropdown')
    )
  }

  component: ReactElement = (
    <Router>
      <SpouseAndDependentComponent />
    </Router>
  )
}

describe('SpouseInfo', () => {
  it('renders an `Add` button when no spouse has been added', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const spouseTest = spousePage.spouse

    // initial state has an add button
    expect(await spouseTest.addButton()).toBeInTheDocument()

    // initial state does not have any forms or labels
    expect(spouseTest.firstNameField()).not.toBeInTheDocument()
    expect(spouseTest.lastNameField()).not.toBeInTheDocument()
    expect(spouseTest.ssnField()).not.toBeInTheDocument()

    spousePage.cleanup()
  })

  it('renders form elements when `Add` button is clicked', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const spouseTest = spousePage.spouse
    userEvent.click(await spouseTest.addButton())

    // forms and labels appear after clicking the add button
    await waitFor(async () => {
      expect(spouseTest.firstNameField()).toBeInTheDocument()
      expect(spouseTest.lastNameField()).toBeInTheDocument()
      expect(spouseTest.ssnField()).toBeInTheDocument()
      expect(await spouseTest.saveButton()).toBeInTheDocument()
      expect(await spouseTest.closeButton()).toBeInTheDocument()
    })

    spousePage.cleanup()
  })

  it('saves and edits a spouse', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const { spouse } = spousePage

    await waitFor(async () =>
      expect(await spouse.addButton()).toBeInTheDocument()
    )

    userEvent.click(await spouse.addButton())

    // add values for each input
    userEvent.type(force(spouse.firstNameField()), 'Sally K')
    userEvent.type(force(spouse.lastNameField()), 'Ride')
    userEvent.clear(force(spouse.ssnField()))
    userEvent.type(force(spouse.ssnField()), '123456789')

    // click the save button
    userEvent.click(await spouse.saveButton())

    // expect first and last name to be concatenated
    expect(
      await spousePage.rendered().findByText('Sally K Ride')
    ).toBeInTheDocument()
    // expect ssn to appear with hyphens
    expect(spousePage.rendered().getByText('123-45-6789')).toBeInTheDocument()

    userEvent.click(await spouse.editButton())

    // expect the edit button to no longer be in the document
    await waitFor(() => expect(spouse.q.editButton()).not.toBeInTheDocument())

    // assert that the input values match what was entered
    expect(force(spouse.firstNameField()).value).toBe('Sally K')
    expect(force(spouse.lastNameField()).value).toBe('Ride')
    expect(force(spouse.ssnField()).value).toBe('123-45-6789')

    // delete the old values and add new ones
    userEvent.type(force(spouse.firstNameField()), '{selectall}{del}Fella')
    userEvent.type(force(spouse.lastNameField()), '{selectall}{del}McGee')
    userEvent.clear(force(spouse.ssnField()))
    userEvent.type(force(spouse.ssnField()), '987-65-4321')

    // click the save button to save the new values
    userEvent.click(await spouse.saveButton())

    // expect the new names to be concatenated and new ssn to appear with hyphens
    expect(
      await spousePage.rendered().findByText('Fella McGee')
    ).toBeInTheDocument()
    expect(spousePage.rendered().getByText('987-65-4321')).toBeInTheDocument()

    // click the delete button
    userEvent.click((await spouse.deleteButtons())[0])

    // the add button is back
    expect(await spouse.addButton()).toBeInTheDocument()

    // expect input fields to not be in the document
    expect(spousePage.rendered().queryAllByRole('textbox')).toHaveLength(0)

    spousePage.cleanup()
  })

  it('does not save when required fields not completed', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const { spouse } = spousePage

    await waitFor(async () =>
      expect(await spouse.addButton()).toBeInTheDocument()
    )

    userEvent.click(force(await spouse.addButton()))

    expect(await spouse.saveButton()).toBeInTheDocument()
    expect(await spouse.closeButton()).toBeInTheDocument()

    // click the save button with empty inputs
    userEvent.click(await spouse.saveButton())

    // expect three `Input is required` errors
    await waitFor(() => expect(spouse.requiredErrors()).toHaveLength(3))
    // fill in the first name incorrectly
    userEvent.type(force(spouse.firstNameField()), 'F$LF(#)& ##3')
    userEvent.click(await spouse.saveButton())

    await waitFor(async () =>
      expect(await spouse.requiredErrors()).toHaveLength(2)
    )

    // fill in the first name correctly
    userEvent.type(force(spouse.firstNameField()), '{selectall}{del}Sally K')
    userEvent.click(await spouse.saveButton())

    await waitFor(async () =>
      expect(await spouse.requiredErrors()).toHaveLength(2)
    )

    // add a name with restricted characters
    userEvent.type(force(spouse.lastNameField()), 'R5$%84')
    userEvent.click(await spouse.saveButton())

    await waitFor(async () =>
      expect(await spouse.requiredErrors()).toHaveLength(1)
    )

    // correctly enter a last name
    userEvent.type(force(spouse.lastNameField()), '{selectall}{del}Ride')
    userEvent.click(await spouse.saveButton())

    // only the ssn error remains
    expect(spouse.requiredErrors()).toHaveLength(1)

    // incorrectly enter ssn
    userEvent.clear(force(spouse.ssnField()))
    userEvent.type(force(spouse.ssnField()), '123sc')
    userEvent.click(await spouse.saveButton())

    expect(
      await spousePage
        .rendered()
        .findByText('Input should be filled with 9 digits')
    ).toBeInTheDocument()

    // clear ssn and add a valid value
    userEvent.clear(force(spouse.ssnField()))
    userEvent.type(force(spouse.ssnField()), '123456789')
    userEvent.click(await spouse.saveButton())

    // expect saved values to be formatted correctly
    expect(await spousePage.rendered().findByText('Sally K Ride'))
    expect(spousePage.rendered().getByText('123-45-6789'))

    // expect ssn error to be gone
    const ssnError = spousePage
      .rendered()
      .queryByText('Input should be filled with 9 digits')
    expect(ssnError).not.toBeInTheDocument()

    // delete the entry
    userEvent.click((await spouse.deleteButtons())[0])

    const inputsAfterDelete = spousePage.rendered().queryAllByRole('textbox')

    expect(inputsAfterDelete).toHaveLength(0)

    spousePage.cleanup()
  })
})

describe('Dependents', () => {
  it('renders an empty dependent list initially', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const { spouse, dependent } = spouseAndDependent

    // Both spouse and dependent add buttons should appear
    expect(await dependent.addButton()).toBeInTheDocument()
    expect(await spouse.addButton()).toBeInTheDocument()

    // initial state does not have forms or labels
    expect(dependent.firstNameField()).not.toBeInTheDocument()
    expect(dependent.lastNameField()).not.toBeInTheDocument()
    expect(dependent.ssnField()).not.toBeInTheDocument()

    spouseAndDependent.cleanup()
  })

  it('renders dependent form element when add button is clicked', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const { spouse, dependent } = spouseAndDependent

    await waitFor(async () => {
      expect(await spouse.addButton()).toBeInTheDocument()
      expect(await dependent.addButton()).toBeInTheDocument()
    })

    const addDependentButton = await dependent.addButton()

    userEvent.click(addDependentButton)

    const dependentFormLabels = [
      'First Name and Initial',
      'Last Name',
      'SSN / TIN',
      'Relationship to Taxpayer',
      'Birth Year',
      'How many months did you live together this year?',
      'Is this person a full-time student?'
    ]

    // Assert all form labels appear
    await waitFor(() => {
      dependentFormLabels.forEach((label) =>
        expect(
          spouseAndDependent.rendered().getByText(label)
        ).toBeInTheDocument()
      )
    })

    userEvent.click(await spouseAndDependent.dependent.closeButton())

    // assert all the labels are now gone
    await waitFor(() => {
      dependentFormLabels.forEach((label) => {
        expect(
          spouseAndDependent.rendered().queryByText(label)
        ).not.toBeInTheDocument()
      })
    })

    spouseAndDependent.cleanup()
  })

  it('saves multiple dependents', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const dependent = spouseAndDependent.dependent

    await waitFor(async () => {
      expect(await dependent.addButton()).toBeInTheDocument()
    })

    const addDependentButton = await dependent.addButton()

    userEvent.click(addDependentButton)

    await waitFor(async () => {
      expect(dependent.firstNameField()).toBeInTheDocument()
    })

    expect(dependent.q.isStudent()).toBeInTheDocument()

    // get all inputs
    const inputs = spouseAndDependent.rendered().getAllByRole('textbox')
    const [
      firstNameInput,
      lastNameInput,
      ssnInput,
      relationInput,
      birthYearInput,
      durationInput
    ] = inputs

    // add values for each input
    userEvent.type(firstNameInput, 'Charlie')
    userEvent.type(lastNameInput, 'Brown')
    userEvent.clear(ssnInput)
    userEvent.type(ssnInput, '222222222')
    userEvent.type(relationInput, 'Son')
    userEvent.type(birthYearInput, '1999')
    userEvent.type(durationInput, '12')
    userEvent.click(force(dependent.q.isStudent()))

    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    const addAnotherDependentButton = await dependent.addButton()
    userEvent.click(addAnotherDependentButton)

    await waitFor(() => expect(dependent.q.isStudent()).toBeInTheDocument())

    const newInputs = spouseAndDependent.rendered().getAllByRole('textbox')
    const [
      newFirstNameInput,
      newLastNameInput,
      newSsnInput,
      newRelationInput,
      newBirthYearInput,
      newDurationInput
    ] = newInputs

    userEvent.type(newFirstNameInput, 'Sally')
    userEvent.type(newLastNameInput, 'Brown')
    userEvent.clear(newSsnInput)
    userEvent.type(newSsnInput, '333333333')
    userEvent.type(newRelationInput, 'Daughter')
    userEvent.type(newBirthYearInput, '2002')
    userEvent.type(newDurationInput, '12')
    userEvent.click(force(dependent.q.isStudent()))

    userEvent.click(await dependent.saveButton())

    await waitFor(async () => {
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    })

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()
    await waitFor(async () => {
      expect(
        spouseAndDependent.rendered().getByText('Sally Brown')
      ).toBeInTheDocument()
    })
    expect(
      spouseAndDependent.rendered().getByText('333-33-3333')
    ).toBeInTheDocument()

    expect(await dependent.deleteButtons()).toHaveLength(2)

    const [deleteCharlie, deleteSally] = await dependent.deleteButtons()

    userEvent.click(deleteSally)

    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Sally Brown')
      ).not.toBeInTheDocument()
    )

    userEvent.click(deleteCharlie)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Charlie Brown')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })

  it('saves and edits multiple dependents', async (): Promise<void> => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const dependent = spouseAndDependent.dependent

    await waitFor(async () => {
      expect(await dependent.addButton()).toBeInTheDocument()
    })

    const addDependentButton = await dependent.addButton()

    userEvent.click(addDependentButton)

    await waitFor(async () =>
      expect(dependent.firstNameField()).toBeInTheDocument()
    )

    // get all inputs
    const inputs = spouseAndDependent.rendered().getAllByRole('textbox')
    const [
      firstNameInput,
      lastNameInput,
      ssnInput,
      relationInput,
      birthYearInput,
      durationInput
    ] = inputs

    // add values for each input
    userEvent.type(firstNameInput, 'Charlie')
    userEvent.type(lastNameInput, 'Brown')
    userEvent.clear(ssnInput)
    userEvent.type(ssnInput, '222222222')
    userEvent.type(relationInput, 'Son')
    userEvent.type(birthYearInput, '1999')
    userEvent.type(durationInput, '12')
    userEvent.click(force(dependent.q.isStudent()))

    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )
    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    userEvent.click(await dependent.addButton())

    await waitFor(async () =>
      expect(dependent.firstNameField()).toBeInTheDocument()
    )

    const newInputs = spouseAndDependent.rendered().getAllByRole('textbox')
    const [
      newFirstNameInput,
      newLastNameInput,
      newSsnInput,
      newRelationInput,
      newBirthYearInput,
      newDurationInput
    ] = newInputs

    userEvent.type(newFirstNameInput, 'Sally')
    userEvent.type(newLastNameInput, 'Brown')
    userEvent.clear(newSsnInput)
    userEvent.type(newSsnInput, '333333333')
    userEvent.type(newRelationInput, 'Daughter')
    userEvent.type(newBirthYearInput, '2002')
    userEvent.type(newDurationInput, '12')
    userEvent.click(force(dependent.q.isStudent()))
    userEvent.click(await dependent.saveButton())

    await waitFor(async () => {
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
      expect(
        spouseAndDependent.rendered().getByText('222-22-2222')
      ).toBeInTheDocument()
      expect(
        spouseAndDependent.rendered().getByText('Sally Brown')
      ).toBeInTheDocument()
      expect(
        spouseAndDependent.rendered().getByText('333-33-3333')
      ).toBeInTheDocument()
    })

    await waitFor(async () => {
      expect(await dependent.editButtons()).toHaveLength(2)
    })

    const editCharlie = (await dependent.editButtons())[0]
    userEvent.click(editCharlie)

    const filledInputs = await spouseAndDependent
      .rendered()
      .findAllByRole('textbox')
    const [
      filledFirstNameInput,
      filledLastNameInput,
      filledSsnInput,
      filledRelationInput,
      filledBirthYearInput,
      filledDurationInput
    ] = filledInputs as HTMLInputElement[]

    expect(filledFirstNameInput.value).toBe('Charlie')
    expect(filledLastNameInput.value).toBe('Brown')
    expect(filledSsnInput.value).toBe('222-22-2222')
    expect(filledRelationInput.value).toBe('Son')
    expect(filledBirthYearInput.value).toBe('1999')
    expect(filledDurationInput.value).toBe('12')
    expect(filledFirstNameInput.value).toBe('Charlie')

    userEvent.type(filledFirstNameInput, '{selectall}{del}Deebo')
    userEvent.clear(filledSsnInput)
    userEvent.type(filledSsnInput, '777777777')

    userEvent.click(await dependent.saveButton())

    await spouseAndDependent.rendered().findByText('Deebo Brown')
    await spouseAndDependent.rendered().findByText('777-77-7777')

    expect(await dependent.deleteButtons()).toHaveLength(2)

    const [deleteDeebo, deleteSally] = await dependent.deleteButtons()

    userEvent.click(deleteSally)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Sally Brown')
      ).not.toBeInTheDocument()
    )

    userEvent.click(deleteDeebo)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Deebo Brown')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })

  it('renders appropriate input errors', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const dependent = spouseAndDependent.dependent

    await waitFor(async () =>
      expect(await dependent.addButton()).toBeInTheDocument()
    )

    userEvent.click(await dependent.addButton())

    const labels = [
      'First Name and Initial',
      'Last Name',
      'SSN / TIN',
      'Relationship to Taxpayer',
      'Birth Year',
      'How many months did you live together this year?',
      'Is this person a full-time student?'
    ]
    // Assert all form labels appear
    await waitFor(() => {
      labels.forEach((label) =>
        expect(
          spouseAndDependent.rendered().getByText(label)
        ).toBeInTheDocument()
      )
    })

    // click the save button with empty inputs
    userEvent.click(await dependent.saveButton())

    // expect six `Input is required` errors
    await waitFor(async () =>
      expect(dependent.requiredErrors()).toHaveLength(6)
    )

    const inputs = spouseAndDependent.rendered().getAllByRole('textbox')
    const [
      firstNameInput,
      lastNameInput,
      ssnInput,
      relationInput,
      birthYearInput,
      durationInput
    ] = inputs

    userEvent.type(firstNameInput, '8675309')
    userEvent.click(await dependent.saveButton())

    await waitFor(async () => {
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()

      expect(dependent.requiredErrors()).toHaveLength(5)
    })

    userEvent.clear(firstNameInput)
    userEvent.type(firstNameInput, 'Booker T')
    userEvent.click(await dependent.saveButton())

    await waitFor(() => {
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()

      expect(dependent.requiredErrors()).toHaveLength(5)
    })

    userEvent.type(lastNameInput, '666')
    userEvent.click(await dependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(4)

    userEvent.type(lastNameInput, '{selectall}{del}Washington')
    userEvent.click(await dependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )
    expect(dependent.requiredErrors()).toHaveLength(4)

    userEvent.clear(ssnInput)
    userEvent.type(ssnInput, '123')
    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should be filled with 9 digits')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(3)

    userEvent.clear(ssnInput)
    userEvent.type(ssnInput, '123456789')
    userEvent.click(await dependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should be filled with 9 digits')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(3)

    userEvent.type(relationInput, '1111')
    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should only include letters and spaces')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(2)

    userEvent.type(relationInput, '{selectall}{del}stepchild')
    userEvent.click(await dependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(2)

    userEvent.type(birthYearInput, 'abcd')
    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findAllByText('Input is required')
      ).toHaveLength(2)
    )

    userEvent.type(birthYearInput, '{selectall}{del}1294')
    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input must be greater than or equal to 1900')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(1)

    userEvent.type(birthYearInput, '{selectall}{del}1999')
    userEvent.click(await dependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input must be greater than or equal to 1900')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(1)

    userEvent.type(durationInput, 'abcd')
    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(dependent.requiredErrors()).toHaveLength(1)
    )

    userEvent.type(durationInput, '{selectall}{del}15')
    userEvent.click(await dependent.saveButton())

    await waitFor(async () =>
      expect(
        spouseAndDependent
          .rendered()
          .queryAllByText('Input must be less than or equal to 12')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(0)

    userEvent.type(durationInput, '{selectall}{del}10')
    userEvent.click(await dependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input must be less than or equal to 12')
      ).not.toBeInTheDocument()
    )
    expect(dependent.requiredErrors()).toHaveLength(0)

    await spouseAndDependent.rendered().findByText('Booker T Washington')
    expect(
      spouseAndDependent.rendered().getByText('123-45-6789')
    ).toBeInTheDocument()

    const deleteBooker = (await dependent.deleteButtons())[0]
    userEvent.click(deleteBooker)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Booker T Washington')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })
})

describe('FilingStatus', () => {
  jest.setTimeout(20000)

  const twoYears = (): fc.Arbitrary<[TaxYear, TaxYear, YearsTaxesState]> =>
    fc.tuple(yarbitraries.taxYear, yarbitraries.taxYear).chain(([y1, y2]) =>
      fc
        .tuple(
          new arbitraries.Arbitraries(TaxYears[y1]).taxPayer(),
          new arbitraries.Arbitraries(TaxYears[y2]).taxPayer()
        )
        .map(([tp1, tp2]): [TaxYear, TaxYear, YearsTaxesState] => [
          y1,
          y2,
          {
            [y1]: { ...blankState, taxPayer: tp1 },
            [y2]: { ...blankState, taxPayer: tp2 },
            activeYear: y1
          }
        ])
    )

  it('should update on year change', async () => {
    await fc.assert(
      fc.asyncProperty(twoYears(), async ([y1, y2, state]) => {
        const { yearStatus, filingStatus } = new SpouseAndDependentTestPage(
          state
        )

        expect(filingStatus.dropdown()).toBeInTheDocument()

        const checkFs = (tp: TaxPayer) => {
          if (
            tp.filingStatus === undefined ||
            !filingStatuses(tp).includes(tp.filingStatus)
          ) {
            expect(filingStatus.selected()).toEqual('')
          } else {
            expect(filingStatus.selected()).toEqual(tp.filingStatus)
          }
        }
        expect(state[y1]?.taxPayer).not.toBeUndefined()
        checkFs(state[y1]?.taxPayer!)
        yearStatus.openDropdown()
        yearStatus.setYear(y2)
        expect(state[y2]?.taxPayer).not.toBeUndefined()
        checkFs(state[y2]?.taxPayer!)
      })
    )
  })
})
