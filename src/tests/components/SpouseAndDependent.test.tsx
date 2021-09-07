import {
  render,
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved
} from '@testing-library/react'
import { Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

import SpouseAndDependent, {
  SpouseInfo
} from 'ustaxes/components/TaxPayer/SpouseAndDependent'
import { store } from 'ustaxes/redux/store'

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

describe('SpouseInfo', () => {
  it('renders an `Add` button when no spouse has been added', () => {
    render(
      <Provider store={store}>
        <SpouseInfo />
      </Provider>
    )
    // initial state has an add button
    screen.getByRole('button', {
      name: /Add/
    })

    // initial state does not have any forms or labels
    const firstNameLabel = screen.queryByLabelText('First Name and Initial')
    expect(firstNameLabel).not.toBeInTheDocument()

    const lastNameLabel = screen.queryByLabelText('Last Name')
    expect(lastNameLabel).not.toBeInTheDocument()

    const ssnLabel = screen.queryByLabelText('SSN / TIN')
    expect(ssnLabel).not.toBeInTheDocument()
  })
  it('renders form elements when `Add` button is clicked', () => {
    render(
      <Provider store={store}>
        <SpouseInfo />
      </Provider>
    )

    const addButton = screen.getByRole('button', {
      name: /Add/
    })

    fireEvent.click(addButton)

    // forms and labels appear after clicking the add button
    screen.getByText('First Name and Initial')
    screen.getByText('Last Name')
    screen.getByText('SSN / TIN')

    screen.getByRole('button', {
      name: /Save/
    })

    screen.getByRole('button', {
      name: /Close/
    })
  })
  it('saves and edits a spouse', async () => {
    render(
      <Provider store={store}>
        <SpouseInfo />
      </Provider>
    )

    const addButton = screen.getByRole('button', {
      name: /Add/
    })

    fireEvent.click(addButton)

    const saveButton = screen.getByRole('button', {
      name: /Save/
    })

    screen.getByRole('button', {
      name: /Close/
    })

    // get all three text inputs
    const inputs = screen.getAllByRole('textbox')
    const [firstNameInput, lastNameInput, ssnInput] = inputs

    // add values for each input
    userEvent.type(firstNameInput, 'Sally K')
    userEvent.type(lastNameInput, 'Ride')
    fireEvent.change(ssnInput, { target: { value: '123456789' } })

    // click the save button
    fireEvent.click(saveButton)

    // expect first and last name to be concatenated
    await screen.findByText('Sally K Ride')
    // expect ssn to appear with hyphens
    screen.getByText('123-45-6789')

    const editButton = screen.getByLabelText('edit')

    // click the edit button
    fireEvent.click(editButton)

    // get all the inputs again, which should be filled this time
    const filledInputs = await screen.findAllByRole('textbox')
    const [filledFirstName, filledLastName, filledSsn] =
      filledInputs as HTMLInputElement[]

    // expect the edit button to no longer be in the document
    expect(editButton).not.toBeInTheDocument()

    // assert that the input values match what was entered
    expect(filledFirstName.value).toBe('Sally K')
    expect(filledLastName.value).toBe('Ride')
    expect(filledSsn.value).toBe('123-45-6789')

    // delete the old values and add new ones
    userEvent.type(filledFirstName, '{selectall}{del}Fella')
    userEvent.type(filledLastName, '{selectall}{del}McGee')
    fireEvent.change(filledSsn, { target: { value: '987-65-4321' } })

    await waitFor(() => {
      // wait for redux-persist to do some async stuff
    })

    // click the save button to save the new values
    fireEvent.click(
      screen.getByRole('button', {
        name: /Save/
      })
    )

    // expect the new names to be concatenated and new ssn to appear with hyphens
    await screen.findByText('Fella McGee')
    screen.getByText('987-65-4321')

    const deleteButton = screen.getByLabelText('delete')

    // click the delete button
    fireEvent.click(deleteButton)

    // the add button is back
    screen.getByRole('button', {
      name: /Add/
    })

    const inputsAfterDelete = screen.queryAllByRole('textbox')

    // expect input fields to not be in the document
    expect(inputsAfterDelete).toHaveLength(0)
  })
  it('does not save when required fields not completed', async () => {
    render(
      <Provider store={store}>
        <SpouseInfo />
      </Provider>
    )

    const addButton = screen.getByRole('button', {
      name: /Add/
    })

    fireEvent.click(addButton)

    const saveButton = screen.getByRole('button', {
      name: /Save/
    })

    screen.getByRole('button', {
      name: /Close/
    })

    // get all inputs
    const inputs = screen.getAllByRole('textbox')
    const [firstNameInput, lastNameInput, ssnInput] = inputs

    // click the save button with empty inputs
    fireEvent.click(saveButton)

    // expect three `Input is required` errors
    const nameErrors = await screen.findAllByText('Input is required')
    expect(nameErrors).toHaveLength(3)

    // fill in the first name incorrectly
    userEvent.type(firstNameInput, 'F$LF(#)& ##3')
    fireEvent.click(saveButton)

    await waitFor(() => {
      // expect no errors about restricted characters
    })

    const nameErrorsAfterBadFirstName = await screen.findAllByText(
      'Input is required'
    )
    expect(nameErrorsAfterBadFirstName).toHaveLength(2)

    // fill in the first name correctly
    userEvent.type(firstNameInput, '{selectall}{del}Sally K')
    fireEvent.click(saveButton)

    await waitFor(() => {
      // expect two name errors
    })
    const nameErrorsAfterAddingFirstName = await screen.findAllByText(
      'Input is required'
    )
    expect(nameErrorsAfterAddingFirstName).toHaveLength(2)

    // add a name with restricted characters
    userEvent.type(lastNameInput, 'R5$%84')
    fireEvent.click(saveButton)

    await waitFor(() => {
      // expect no error about restricted characters, and one name required error
    })
    const nameErrorsAfterBadLastName = await screen.findAllByText(
      'Input is required'
    )
    expect(nameErrorsAfterBadLastName).toHaveLength(1)

    // correctly enter a last name
    userEvent.type(lastNameInput, '{selectall}{del}Ride')
    fireEvent.click(saveButton)

    // only the ssn error remains
    await screen.findByText('Input is required')

    // incorrectly enter ssn
    fireEvent.change(ssnInput, { target: { value: '123sc' } })
    fireEvent.click(saveButton)

    await waitFor(() => {
      // expect ssn error to remain
    })
    await screen.findByText('Input should be filled with 9 digits')

    // clear ssn and add a valid value
    fireEvent.change(ssnInput, { target: { value: '' } })
    fireEvent.change(ssnInput, { target: { value: '123456789' } })
    fireEvent.click(saveButton)

    // expect saved values to be formatted correctly
    await screen.findByText('Sally K Ride')
    screen.getByText('123-45-6789')

    // expect ssn error to be gone
    const ssnError = screen.queryByText('Input should be filled with 9 digits')
    expect(ssnError).not.toBeInTheDocument()

    // delete the entry
    const deleteButton = screen.getByLabelText('delete')
    fireEvent.click(deleteButton)

    screen.getByRole('button', {
      name: /Add/
    })

    const inputsAfterDelete = screen.queryAllByRole('textbox')

    expect(inputsAfterDelete).toHaveLength(0)
  })
})

describe('Dependents', () => {
  it('renders an empty dependent list initially', () => {
    render(
      <Provider store={store}>
        <SpouseAndDependent />
      </Provider>
    )

    screen.getByText('Spouse Information')
    screen.getByText('Dependent Information')

    // initial state has add buttons
    const addButtons = screen.getAllByRole('button', {
      name: /Add/
    })
    // Both spouse and dependent add buttons should appear
    expect(addButtons).toHaveLength(2)

    // initial state does not have forms or labels
    const firstNameLabel = screen.queryByLabelText('First Name and Initial')
    expect(firstNameLabel).not.toBeInTheDocument()

    const lastNameLabel = screen.queryByLabelText('Last Name')
    expect(lastNameLabel).not.toBeInTheDocument()

    const ssnLabel = screen.queryByLabelText('SSN / TIN')
    expect(ssnLabel).not.toBeInTheDocument()
  })
  it('renders dependent form element when add button is clicked', async () => {
    render(
      <Provider store={store}>
        <SpouseAndDependent />
      </Provider>
    )

    const addButtons = screen.getAllByRole('button', {
      name: /Add/
    })

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [_, addDependentButton] = addButtons

    fireEvent.click(addDependentButton)

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
    for (const label of dependentFormLabels) {
      screen.getByText(label)
    }

    const closeButton = screen.getByRole('button', {
      name: /Close/
    })

    fireEvent.click(closeButton)

    // assert all the labels are now gone
    for (const label of dependentFormLabels) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }
  })
  it('saves multiple dependents', async () => {
    render(
      <Provider store={store}>
        <SpouseAndDependent />
      </Provider>
    )

    const addButtons = screen.getAllByRole('button', {
      name: /Add/
    })

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [_, addDependentButton] = addButtons

    fireEvent.click(addDependentButton)

    const saveButton = screen.getByRole('button', {
      name: /Save/
    })

    const studentLabel = screen.getByText('Is this person a full-time student?')

    // get all inputs
    const inputs = screen.getAllByRole('textbox')
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
    fireEvent.change(ssnInput, { target: { value: '222222222' } })
    userEvent.type(relationInput, 'Son')
    userEvent.type(birthYearInput, '1999')
    userEvent.type(durationInput, '12')
    fireEvent.click(studentLabel)

    fireEvent.click(saveButton)

    await screen.findByText('Charlie Brown')
    screen.getByText('222-22-2222')

    const addButtonsAfterAdd = screen.getAllByRole('button', {
      name: /Add/
    })
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [_addSpouse, addAnotherDependentButton] = addButtonsAfterAdd

    fireEvent.click(addAnotherDependentButton)
    const newStudentLabel = screen.getByText(
      'Is this person a full-time student?'
    )

    const newInputs = screen.getAllByRole('textbox')
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
    fireEvent.change(newSsnInput, { target: { value: '333333333' } })
    userEvent.type(newRelationInput, 'Daughter')
    userEvent.type(newBirthYearInput, '2002')
    userEvent.type(newDurationInput, '12')
    fireEvent.click(newStudentLabel)

    const newSaveButton = screen.getByRole('button', {
      name: /Save/
    })
    fireEvent.click(newSaveButton)

    await screen.findByText('Charlie Brown')
    screen.getByText('222-22-2222')
    screen.getByText('Sally Brown')
    screen.getByText('333-33-3333')

    const deleteButtons = screen.getAllByLabelText('delete')
    expect(deleteButtons).toHaveLength(2)

    const [deleteCharlie, deleteSally] = deleteButtons

    fireEvent.click(deleteSally)
    await waitFor(() =>
      expect(screen.queryByText('Sally Brown')).not.toBeInTheDocument()
    )

    fireEvent.click(deleteCharlie)
    await waitFor(() =>
      expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument()
    )
  })
  it('saves and edits multiple dependents', async () => {
    render(
      <Provider store={store}>
        <SpouseAndDependent />
      </Provider>
    )

    const addButtons = screen.getAllByRole('button', {
      name: /Add/
    })

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [_, addDependentButton] = addButtons

    fireEvent.click(addDependentButton)

    const saveButton = screen.getByRole('button', {
      name: /Save/
    })

    const studentLabel = screen.getByText('Is this person a full-time student?')

    // get all inputs
    const inputs = screen.getAllByRole('textbox')
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
    fireEvent.change(ssnInput, { target: { value: '222222222' } })
    userEvent.type(relationInput, 'Son')
    userEvent.type(birthYearInput, '1999')
    userEvent.type(durationInput, '12')
    fireEvent.click(studentLabel)

    fireEvent.click(saveButton)

    await screen.findByText('Charlie Brown')
    screen.getByText('222-22-2222')

    const addButtonsAfterAdd = screen.getAllByRole('button', {
      name: /Add/
    })
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [_addSpouse, addAnotherDependentButton] = addButtonsAfterAdd

    fireEvent.click(addAnotherDependentButton)
    const newStudentLabel = screen.getByText(
      'Is this person a full-time student?'
    )

    const newInputs = screen.getAllByRole('textbox')
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
    fireEvent.change(newSsnInput, { target: { value: '333333333' } })
    userEvent.type(newRelationInput, 'Daughter')
    userEvent.type(newBirthYearInput, '2002')
    userEvent.type(newDurationInput, '12')
    fireEvent.click(newStudentLabel)

    const newSaveButton = screen.getByRole('button', {
      name: /Save/
    })
    fireEvent.click(newSaveButton)

    await screen.findByText('Charlie Brown')
    screen.getByText('222-22-2222')
    screen.getByText('Sally Brown')
    screen.getByText('333-33-3333')

    const editButtons = screen.getAllByLabelText('edit')

    const [editCharlie, editSally] = editButtons
    fireEvent.click(editCharlie)

    const filledInputs = await screen.findAllByRole('textbox')
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
    fireEvent.change(filledSsnInput, { target: { value: '777777777' } })

    fireEvent.click(
      screen.getByRole('button', {
        name: /Save/
      })
    )

    await screen.findByText('Deebo Brown')
    await screen.findByText('777-77-7777')

    const deleteButtons = screen.getAllByLabelText('delete')
    expect(deleteButtons).toHaveLength(2)

    const [deleteDeebo, deleteSally] = deleteButtons

    fireEvent.click(deleteSally)
    await waitFor(() =>
      expect(screen.queryByText('Sally Brown')).not.toBeInTheDocument()
    )

    fireEvent.click(deleteDeebo)
    await waitFor(() =>
      expect(screen.queryByText('Deebo Brown')).not.toBeInTheDocument()
    )
  })

  it('renders appropriate input errors', async () => {
    render(
      <Provider store={store}>
        <SpouseAndDependent />
      </Provider>
    )

    const addButtons = screen.getAllByRole('button', {
      name: /Add/
    })

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [_, addDependentButton] = addButtons

    fireEvent.click(addDependentButton)

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
    for (const label of labels) {
      screen.getByText(label)
    }

    const saveButton = screen.getByRole('button', {
      name: /Save/
    })

    // click the save button with empty inputs
    fireEvent.click(saveButton)

    // expect six `Input is required` errors
    const nameErrors = await screen.findAllByText('Input is required')
    expect(nameErrors).toHaveLength(6)

    const inputs = screen.getAllByRole('textbox')
    const [
      firstNameInput,
      lastNameInput,
      ssnInput,
      relationInput,
      birthYearInput,
      durationInput
    ] = inputs

    userEvent.type(firstNameInput, '8675309')
    fireEvent.click(saveButton)

    const firstNameErrors: HTMLElement[] = await screen
      .findAllByText('Input should only include letters and spaces')
      .catch(() => [])
    expect(firstNameErrors).toHaveLength(0)
    expect(screen.getAllByText('Input is required')).toHaveLength(5)

    userEvent.type(firstNameInput, '{selectall}{del}Booker T')
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        screen.queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )
    expect(screen.getAllByText('Input is required')).toHaveLength(5)

    userEvent.type(lastNameInput, '666')
    fireEvent.click(saveButton)

    const lastNameErrors = await screen
      .findAllByText('Input should only include letters and spaces')
      .catch(() => [])
    expect(lastNameErrors).toHaveLength(0)
    expect(screen.getAllByText('Input is required')).toHaveLength(4)

    userEvent.type(lastNameInput, '{selectall}{del}Washington')
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        screen.queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )
    expect(screen.getAllByText('Input is required')).toHaveLength(4)

    fireEvent.change(ssnInput, { target: { value: '123' } })
    fireEvent.click(saveButton)

    const ssnErrors = await screen.findAllByText(
      'Input should be filled with 9 digits'
    )
    expect(ssnErrors).toHaveLength(1)
    expect(screen.getAllByText('Input is required')).toHaveLength(3)

    fireEvent.change(ssnInput, { target: { value: '' } })
    fireEvent.change(ssnInput, { target: { value: '123456789' } })
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        screen.queryByText('Input should be filled with 9 digits')
      ).not.toBeInTheDocument()
    )
    expect(screen.getAllByText('Input is required')).toHaveLength(3)

    userEvent.type(relationInput, '1111')
    fireEvent.click(saveButton)

    const relationshipErrors = await screen.findAllByText(
      'Input should only include letters and spaces'
    )
    expect(relationshipErrors).toHaveLength(1)
    expect(screen.getAllByText('Input is required')).toHaveLength(2)

    userEvent.type(relationInput, '{selectall}{del}stepchild')
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        screen.queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )
    expect(screen.getAllByText('Input is required')).toHaveLength(2)

    userEvent.type(birthYearInput, 'abcd')
    fireEvent.click(saveButton)

    const inputErrors = await screen.findAllByText('Input is required')
    expect(inputErrors).toHaveLength(2)

    userEvent.type(birthYearInput, '{selectall}{del}1294')
    fireEvent.click(saveButton)

    const newBirthErrors = await screen.findAllByText(
      'Input must be greater than or equal to 1900'
    )
    expect(newBirthErrors).toHaveLength(1)
    expect(screen.getAllByText('Input is required')).toHaveLength(1)

    userEvent.type(birthYearInput, '{selectall}{del}1999')
    fireEvent.click(saveButton)

    await waitFor(() =>
      expect(
        screen.queryByText('Input must be greater than or equal to 1900')
      ).not.toBeInTheDocument()
    )
    expect(screen.getAllByText('Input is required')).toHaveLength(1)

    userEvent.type(durationInput, 'abcd')
    fireEvent.click(saveButton)

    expect(screen.getAllByText('Input is required')).toHaveLength(1)

    userEvent.type(durationInput, '{selectall}{del}15')
    fireEvent.click(saveButton)

    const newDurationErrors = await screen.findAllByText(
      'Input must be less than or equal to 12'
    )
    expect(newDurationErrors).toHaveLength(1)
    expect(screen.queryAllByText('Input is required')).toHaveLength(0)

    userEvent.type(durationInput, '{selectall}{del}10')
    fireEvent.click(saveButton)

    await waitForElementToBeRemoved(() =>
      screen.queryByText('Input must be less than or equal to 12')
    )
    expect(screen.queryAllByText('Input is required')).toHaveLength(0)

    await screen.findByText('Booker T Washington')
    screen.getByText('123-45-6789')

    const deleteBooker = screen.getByLabelText('delete')
    fireEvent.click(deleteBooker)
    await waitFor(() =>
      expect(screen.queryByText('Booker T Washington')).not.toBeInTheDocument()
    )
  })
})
