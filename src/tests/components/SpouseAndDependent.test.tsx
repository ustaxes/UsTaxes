import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import SpouseAndDependent, {
  SpouseInfo
} from 'ustaxes/components/TaxPayer/SpouseAndDependent'
import { store } from 'ustaxes/redux/store'
import { TestPage } from '../common/Page'
import { ReactElement } from 'react'
import { labels as personLabels } from 'ustaxes/components/TaxPayer/PersonFields'
import { BrowserRouter as Router } from 'react-router-dom'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
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

abstract class CommonPageComponents extends TestPage {
  firstNameField = (): HTMLInputElement | null =>
    this.rendered().queryByLabelText(
      personLabels.fname
    ) as HTMLInputElement | null
  lastNameField = (): HTMLInputElement | null =>
    this.rendered().queryByLabelText(
      personLabels.lname
    ) as HTMLInputElement | null
  ssnField = (): HTMLInputElement | null =>
    this.rendered().queryByLabelText(
      personLabels.ssn
    ) as HTMLInputElement | null

  requiredErrors = (): HTMLElement[] =>
    this.rendered().queryAllByText('Input is required')

  saveButton = async (): Promise<HTMLButtonElement> =>
    (await this.rendered().findByRole('button', {
      name: /Save/
    })) as HTMLButtonElement

  closeButton = async (): Promise<HTMLButtonElement> =>
    (await this.rendered().findByRole('button', {
      name: /Discard/i
    })) as HTMLButtonElement

  deleteButtons = async (): Promise<HTMLButtonElement[]> =>
    (await this.rendered().findAllByRole('button', {
      name: /delete/
    })) as HTMLButtonElement[]
}

class SpouseTestPage extends CommonPageComponents {
  component: ReactElement = (
    <Router>
      <SpouseInfo />
    </Router>
  )

  addButton = async (): Promise<HTMLButtonElement> =>
    (await this.rendered().findByRole('button', {
      name: /Add/
    })) as HTMLButtonElement

  q = {
    editButton: (): HTMLButtonElement | null =>
      this.rendered().queryByLabelText('edit') as HTMLButtonElement | null
  }

  editButton = async (): Promise<HTMLButtonElement> =>
    (await this.rendered().findByLabelText('edit')) as HTMLButtonElement
}

class SpouseAndDependentTestPage extends CommonPageComponents {
  component: ReactElement = (
    <Router>
      <SpouseAndDependent />
    </Router>
  )

  addButtons = async (): Promise<HTMLButtonElement[]> =>
    (await this.rendered().findAllByRole('button', {
      name: /Add/
    })) as HTMLButtonElement[]
  editButtons = async (): Promise<HTMLButtonElement[]> =>
    (await this.rendered().findAllByLabelText('edit')) as HTMLButtonElement[]

  q = {
    isStudent: (): HTMLInputElement | null =>
      this.rendered().queryByText(
        'Is this person a full-time student?'
      ) as HTMLInputElement | null
  }
}

describe('SpouseInfo', () => {
  it('renders an `Add` button when no spouse has been added', async () => {
    const spouseTest = new SpouseTestPage(store.getState())

    // initial state has an add button
    expect(await spouseTest.addButton()).toBeInTheDocument()

    // initial state does not have any forms or labels
    expect(spouseTest.firstNameField()).not.toBeInTheDocument()
    expect(spouseTest.lastNameField()).not.toBeInTheDocument()
    expect(spouseTest.ssnField()).not.toBeInTheDocument()

    spouseTest.cleanup()
  })

  it('renders form elements when `Add` button is clicked', async () => {
    const spouseTest = new SpouseTestPage(store.getState())
    userEvent.click(await spouseTest.addButton())

    // forms and labels appear after clicking the add button
    await waitFor(async () => {
      expect(spouseTest.firstNameField()).toBeInTheDocument()
      expect(spouseTest.lastNameField()).toBeInTheDocument()
      expect(spouseTest.ssnField()).toBeInTheDocument()
      expect(await spouseTest.saveButton()).toBeInTheDocument()
      expect(await spouseTest.closeButton()).toBeInTheDocument()
    })

    spouseTest.cleanup()
  })

  it('saves and edits a spouse', async () => {
    const spouseTest = new SpouseTestPage(store.getState())

    await waitFor(async () =>
      expect(await spouseTest.addButton()).toBeInTheDocument()
    )

    userEvent.click(await spouseTest.addButton())

    // add values for each input
    userEvent.type(force(spouseTest.firstNameField()), 'Sally K')
    userEvent.type(force(spouseTest.lastNameField()), 'Ride')
    userEvent.clear(force(spouseTest.ssnField()))
    userEvent.type(force(spouseTest.ssnField()), '123456789')

    // click the save button
    userEvent.click(await spouseTest.saveButton())

    // expect first and last name to be concatenated
    expect(
      await spouseTest.rendered().findByText('Sally K Ride')
    ).toBeInTheDocument()
    // expect ssn to appear with hyphens
    expect(spouseTest.rendered().getByText('123-45-6789')).toBeInTheDocument()

    userEvent.click(await spouseTest.editButton())

    // expect the edit button to no longer be in the document
    await waitFor(() =>
      expect(spouseTest.q.editButton()).not.toBeInTheDocument()
    )

    // assert that the input values match what was entered
    expect(force(spouseTest.firstNameField()).value).toBe('Sally K')
    expect(force(spouseTest.lastNameField()).value).toBe('Ride')
    expect(force(spouseTest.ssnField()).value).toBe('123-45-6789')

    // delete the old values and add new ones
    userEvent.type(force(spouseTest.firstNameField()), '{selectall}{del}Fella')
    userEvent.type(force(spouseTest.lastNameField()), '{selectall}{del}McGee')
    userEvent.clear(force(spouseTest.ssnField()))
    userEvent.type(force(spouseTest.ssnField()), '987-65-4321')

    // click the save button to save the new values
    userEvent.click(await spouseTest.saveButton())

    // expect the new names to be concatenated and new ssn to appear with hyphens
    expect(
      await spouseTest.rendered().findByText('Fella McGee')
    ).toBeInTheDocument()
    expect(spouseTest.rendered().getByText('987-65-4321')).toBeInTheDocument()

    // click the delete button
    userEvent.click((await spouseTest.deleteButtons())[0])

    // the add button is back
    expect(await spouseTest.addButton()).toBeInTheDocument()

    // expect input fields to not be in the document
    expect(spouseTest.rendered().queryAllByRole('textbox')).toHaveLength(0)

    spouseTest.cleanup()
  })

  it('does not save when required fields not completed', async () => {
    const spouseTest = new SpouseTestPage(store.getState())

    await waitFor(async () =>
      expect(await spouseTest.addButton()).toBeInTheDocument()
    )

    userEvent.click(force(await spouseTest.addButton()))

    expect(await spouseTest.saveButton()).toBeInTheDocument()
    expect(await spouseTest.closeButton()).toBeInTheDocument()

    // click the save button with empty inputs
    userEvent.click(await spouseTest.saveButton())

    // expect three `Input is required` errors
    await waitFor(() => expect(spouseTest.requiredErrors()).toHaveLength(3))
    // fill in the first name incorrectly
    userEvent.type(force(spouseTest.firstNameField()), 'F$LF(#)& ##3')
    userEvent.click(await spouseTest.saveButton())

    await waitFor(async () =>
      expect(await spouseTest.requiredErrors()).toHaveLength(2)
    )

    // fill in the first name correctly
    userEvent.type(
      force(spouseTest.firstNameField()),
      '{selectall}{del}Sally K'
    )
    userEvent.click(await spouseTest.saveButton())

    await waitFor(async () =>
      expect(await spouseTest.requiredErrors()).toHaveLength(2)
    )

    // add a name with restricted characters
    userEvent.type(force(spouseTest.lastNameField()), 'R5$%84')
    userEvent.click(await spouseTest.saveButton())

    await waitFor(async () =>
      expect(await spouseTest.requiredErrors()).toHaveLength(1)
    )

    // correctly enter a last name
    userEvent.type(force(spouseTest.lastNameField()), '{selectall}{del}Ride')
    userEvent.click(await spouseTest.saveButton())

    // only the ssn error remains
    expect(spouseTest.requiredErrors()).toHaveLength(1)

    // incorrectly enter ssn
    userEvent.clear(force(spouseTest.ssnField()))
    userEvent.type(force(spouseTest.ssnField()), '123sc')
    userEvent.click(await spouseTest.saveButton())

    expect(
      await spouseTest
        .rendered()
        .findByText('Input should be filled with 9 digits')
    ).toBeInTheDocument()

    // clear ssn and add a valid value
    userEvent.clear(force(spouseTest.ssnField()))
    userEvent.type(force(spouseTest.ssnField()), '123456789')
    userEvent.click(await spouseTest.saveButton())

    // expect saved values to be formatted correctly
    expect(await spouseTest.rendered().findByText('Sally K Ride'))
    expect(spouseTest.rendered().getByText('123-45-6789'))

    // expect ssn error to be gone
    const ssnError = spouseTest
      .rendered()
      .queryByText('Input should be filled with 9 digits')
    expect(ssnError).not.toBeInTheDocument()

    // delete the entry
    userEvent.click((await spouseTest.deleteButtons())[0])

    const inputsAfterDelete = spouseTest.rendered().queryAllByRole('textbox')

    expect(inputsAfterDelete).toHaveLength(0)

    spouseTest.cleanup()
  })
})

describe('Dependents', () => {
  it('renders an empty dependent list initially', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())

    await waitFor(async () => {
      expect(
        await spouseAndDependent.rendered().findByText('Spouse Information')
      ).toBeInTheDocument()

      expect(
        await spouseAndDependent.rendered().findByText('Dependent Information')
      ).toBeInTheDocument()

      // Both spouse and dependent add buttons should appear
      expect(await spouseAndDependent.addButtons()).toHaveLength(2)

      // initial state does not have forms or labels
      expect(spouseAndDependent.firstNameField()).not.toBeInTheDocument()
      expect(spouseAndDependent.lastNameField()).not.toBeInTheDocument()
      expect(spouseAndDependent.ssnField()).not.toBeInTheDocument()
    })

    spouseAndDependent.cleanup()
  })

  it('renders dependent form element when add button is clicked', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())

    await waitFor(async () => {
      expect(await spouseAndDependent.addButtons()).toHaveLength(2)
    })

    const addDependentButton = (await spouseAndDependent.addButtons())[1]

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

    userEvent.click(await spouseAndDependent.closeButton())

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

    await waitFor(async () => {
      expect(await spouseAndDependent.addButtons()).toHaveLength(2)
    })

    const addDependentButton = (await spouseAndDependent.addButtons())[1]

    userEvent.click(addDependentButton)

    await waitFor(async () => {
      expect(spouseAndDependent.firstNameField()).toBeInTheDocument()
    })

    expect(spouseAndDependent.q.isStudent()).toBeInTheDocument()

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
    userEvent.click(force(spouseAndDependent.q.isStudent()))

    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    const addAnotherDependentButton = (await spouseAndDependent.addButtons())[1]
    userEvent.click(addAnotherDependentButton)

    await waitFor(() =>
      expect(spouseAndDependent.q.isStudent()).toBeInTheDocument()
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
    userEvent.click(force(spouseAndDependent.q.isStudent()))

    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () => {
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    })

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()
    expect(
      spouseAndDependent.rendered().getByText('Sally Brown')
    ).toBeInTheDocument()
    expect(
      spouseAndDependent.rendered().getByText('333-33-3333')
    ).toBeInTheDocument()

    expect(await spouseAndDependent.deleteButtons()).toHaveLength(2)

    const [deleteCharlie, deleteSally] =
      await spouseAndDependent.deleteButtons()

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

    await waitFor(async () => {
      expect(await spouseAndDependent.addButtons()).toHaveLength(2)
    })

    const addDependentButton = (await spouseAndDependent.addButtons())[1]

    userEvent.click(addDependentButton)

    await waitFor(async () =>
      expect(spouseAndDependent.firstNameField()).toBeInTheDocument()
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
    userEvent.click(force(spouseAndDependent.q.isStudent()))

    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )
    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    const addAnotherDependentButton = (await spouseAndDependent.addButtons())[1]

    userEvent.click(addAnotherDependentButton)

    await waitFor(async () =>
      expect(spouseAndDependent.firstNameField()).toBeInTheDocument()
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
    userEvent.click(force(spouseAndDependent.q.isStudent()))

    userEvent.click(await spouseAndDependent.saveButton())

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
      expect(await spouseAndDependent.editButtons()).toHaveLength(2)
    })

    const editCharlie = (await spouseAndDependent.editButtons())[0]
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

    userEvent.click(await spouseAndDependent.saveButton())

    await spouseAndDependent.rendered().findByText('Deebo Brown')
    await spouseAndDependent.rendered().findByText('777-77-7777')

    expect(await spouseAndDependent.deleteButtons()).toHaveLength(2)

    const [deleteDeebo, deleteSally] = await spouseAndDependent.deleteButtons()

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

    await waitFor(async () =>
      expect(await spouseAndDependent.addButtons()).toHaveLength(2)
    )

    const addDependentButton = (await spouseAndDependent.addButtons())[1]

    userEvent.click(addDependentButton)

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
    userEvent.click(await spouseAndDependent.saveButton())

    // expect six `Input is required` errors
    await waitFor(async () =>
      expect(spouseAndDependent.requiredErrors()).toHaveLength(6)
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
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () => {
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()

      expect(spouseAndDependent.requiredErrors()).toHaveLength(5)
    })

    userEvent.clear(firstNameInput)
    userEvent.type(firstNameInput, 'Booker T')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(() => {
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()

      expect(spouseAndDependent.requiredErrors()).toHaveLength(5)
    })

    userEvent.type(lastNameInput, '666')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(4)

    userEvent.type(lastNameInput, '{selectall}{del}Washington')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )
    expect(spouseAndDependent.requiredErrors()).toHaveLength(4)

    userEvent.clear(ssnInput)
    userEvent.type(ssnInput, '123')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should be filled with 9 digits')
      ).toHaveLength(1)
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(3)

    userEvent.clear(ssnInput)
    userEvent.type(ssnInput, '123456789')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should be filled with 9 digits')
      ).not.toBeInTheDocument()
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(3)

    userEvent.type(relationInput, '1111')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should only include letters and spaces')
      ).toHaveLength(1)
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(2)

    userEvent.type(relationInput, '{selectall}{del}stepchild')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(2)

    userEvent.type(birthYearInput, 'abcd')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findAllByText('Input is required')
      ).toHaveLength(2)
    )

    userEvent.type(birthYearInput, '{selectall}{del}1294')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input must be greater than or equal to 1900')
      ).toHaveLength(1)
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(1)

    userEvent.type(birthYearInput, '{selectall}{del}1999')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input must be greater than or equal to 1900')
      ).not.toBeInTheDocument()
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(1)

    userEvent.type(durationInput, 'abcd')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(spouseAndDependent.requiredErrors()).toHaveLength(1)
    )

    userEvent.type(durationInput, '{selectall}{del}15')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(async () =>
      expect(
        spouseAndDependent
          .rendered()
          .queryAllByText('Input must be less than or equal to 12')
      ).toHaveLength(1)
    )

    expect(spouseAndDependent.requiredErrors()).toHaveLength(0)

    userEvent.type(durationInput, '{selectall}{del}10')
    userEvent.click(await spouseAndDependent.saveButton())

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input must be less than or equal to 12')
      ).not.toBeInTheDocument()
    )
    expect(spouseAndDependent.requiredErrors()).toHaveLength(0)

    await spouseAndDependent.rendered().findByText('Booker T Washington')
    expect(
      spouseAndDependent.rendered().getByText('123-45-6789')
    ).toBeInTheDocument()

    const deleteBooker = (await spouseAndDependent.deleteButtons())[0]
    userEvent.click(deleteBooker)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Booker T Washington')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })
})
