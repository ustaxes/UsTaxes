import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

import { SpouseInfo } from './SpouseAndDependent'
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
    const [firstNameInput, lastNameInput, ssidInput] = inputs

    // add values for each input
    userEvent.type(firstNameInput, 'Sally K')
    userEvent.type(lastNameInput, 'Ride')
    fireEvent.change(ssidInput, { target: { value: '123456789' } })

    // click the save button
    fireEvent.click(saveButton)

    // expect first and last name to be concatenated
    await screen.findByText('Sally K Ride')
    // expect ssid to appear with hyphens
    screen.getByText('123-45-6789')

    const editButton = screen.getByLabelText('edit')

    // click the edit button
    fireEvent.click(editButton)

    // get all the inputs again, which should be filled this time
    const filledInputs = await screen.findAllByRole('textbox')
    const [filledFirstName, filledLastName, filledSsid] = filledInputs as HTMLInputElement[]

    // expect the edit button to no longer be in the document
    expect(editButton).not.toBeInTheDocument()

    // assert that the input values match what was entered
    expect(filledFirstName.value).toBe('Sally K')
    expect(filledLastName.value).toBe('Ride')
    expect(filledSsid.value).toBe('123-45-6789')

    // delete the old values and add new ones
    userEvent.type(filledFirstName, '{selectall}{del}Fella')
    userEvent.type(filledLastName, '{selectall}{del}McGee')
    fireEvent.change(filledSsid, { target: { value: '987-65-4321' } })

    // wait for redux-persist to do some async stuff
    await waitFor(() => {})

    // click the save button to save the new values
    fireEvent.click(screen.getByRole('button', {
      name: /Save/
    }))

    // expect the new names to be concatenated and new ssid to appear with hyphens
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
    const [firstNameInput, lastNameInput, ssidInput] = inputs

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

    // only the ssid error remains
    await screen.findByText('Input is required')

    // incorrectly enter ssid
    fireEvent.change(ssidInput, { target: { value: '123sc' } })
    fireEvent.click(saveButton)

    // expect ssid error to remain
    await waitFor(() => {})
    await screen.findByText('Input should be filled with 9 digits')

    // clear ssid and add a valid value
    fireEvent.change(ssidInput, { target: { value: '' } })
    fireEvent.change(ssidInput, { target: { value: '123456789' } })
    fireEvent.click(saveButton)

    // expect saved values to be formatted correctly
    await screen.findByText('Sally K Ride')
    screen.getByText('123-45-6789')

    // expect ssid error to be gone
    const ssidError = screen.queryByText('Input should be filled with 9 digits')
    expect(ssidError).not.toBeInTheDocument()

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
