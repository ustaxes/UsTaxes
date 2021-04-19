import React from 'react'
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

import SpouseAndDependent, { SpouseInfo } from './SpouseAndDependent'
import { store } from '../../redux/store'

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
    const [filledFirstName, filledLastName, filledSsn] = filledInputs as HTMLInputElement[]

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

    // wait for redux-persist to do some async stuff
    await waitFor(() => {})

    // click the save button to save the new values
    fireEvent.click(screen.getByRole('button', {
      name: /Save/
    }))

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

    // expect two input errors and an error about restricted characters
    await waitFor(() => {})
    const nameErrorsAfterBadFirstName = await screen.findAllByText('Input is required')
    expect(nameErrorsAfterBadFirstName).toHaveLength(2)
    screen.getByText('Input should only include letters and spaces')

    // fill in the first name correctly
    userEvent.type(firstNameInput, '{selectall}{del}Sally K')
    fireEvent.click(saveButton)

    // expect two name errors
    await waitFor(() => {})
    const nameErrorsAfterAddingFirstName = await screen.findAllByText('Input is required')
    expect(nameErrorsAfterAddingFirstName).toHaveLength(2)

    // add a name with restricted characters
    userEvent.type(lastNameInput, 'R5$%84')
    fireEvent.click(saveButton)

    // expect an error about restricted characters, and one name error
    await waitFor(() => {})
    const nameErrorsAfterBadLastName = await screen.findAllByText('Input is required')
    expect(nameErrorsAfterBadLastName).toHaveLength(1)
    screen.getByText('Input should only include letters and spaces')

    // correctly enter a last name
    userEvent.type(lastNameInput, '{selectall}{del}Ride')
    fireEvent.click(saveButton)

    // only the ssn error remains
    await screen.findByText('Input is required')

    // incorrectly enter ssn
    fireEvent.change(ssnInput, { target: { value: '123sc' } })
    fireEvent.click(saveButton)

    // expect ssn error to remain
    await waitFor(() => {})
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

    // initial state has an add button
    const addButtons = screen.getAllByRole('button', {
      name: /Add/
    })
    // Both spouse and dependent add buttons should appear
    expect(addButtons).toHaveLength(2)

    // initial state does not have any forms or labels
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

    const labels = ['First Name and Initial', 'Last Name', 'SSN / TIN', 'Relationship to Taxpayer', 'Birth Year', 'How many months did you live together this year?', 'Is this person a full-time student?']
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

    const closeButton = screen.getByRole('button', {
      name: /Close/
    })

    fireEvent.click(closeButton)

    for (const label of labels) {
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
    const [firstNameInput, lastNameInput, ssnInput, relationInput, birthYearInput, durationInput] = inputs

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
    const newStudentLabel = screen.getByText('Is this person a full-time student?')

    const newInputs = screen.getAllByRole('textbox')
    const [newFirstNameInput, newLastNameInput, newSsnInput, newRelationInput, newBirthYearInput, newDurationInput] = newInputs

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
    await waitFor(() => expect(screen.queryByText('Sally Brown')).not.toBeInTheDocument())

    fireEvent.click(deleteCharlie)
    await waitFor(() => expect(screen.queryByText('Charlie Brown')).not.toBeInTheDocument())
  })
})
