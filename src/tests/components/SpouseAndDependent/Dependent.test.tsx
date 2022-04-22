/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { store } from 'ustaxes/redux/store'
import log from 'ustaxes/core/log'
import { SpouseAndDependentTestPage } from './Pages'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

beforeAll(() => {
  log.setLevel(log.levels.TRACE)
})

jest.setTimeout(10000)

jest.mock('redux-persist', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const real = jest.requireActual('redux-persist')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...real,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
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

    await waitFor(() => {
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
    userEvent.click(dependent.q.isStudent()!)

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
    userEvent.click(dependent.q.isStudent()!)

    userEvent.click(await dependent.saveButton())

    await waitFor(async () => {
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    })

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()
    await waitFor(() => {
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

    await waitFor(() => expect(dependent.firstNameField()).toBeInTheDocument())

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
    userEvent.click(dependent.q.isStudent()!)

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

    await waitFor(() => expect(dependent.firstNameField()).toBeInTheDocument())

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
    userEvent.click(dependent.q.isStudent()!)
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
    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(6))

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

    await waitFor(() => {
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

    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(1))

    userEvent.type(durationInput, '{selectall}{del}15')
    userEvent.click(await dependent.saveButton())

    await waitFor(() =>
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
