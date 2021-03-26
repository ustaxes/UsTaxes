import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

import { SpouseInfo } from './SpouseAndDependent'
import { store } from '../../redux/store'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
})

describe('SpouseInfo', () => {
  it('renders an `Add` button when no spouse has been added', () => {
    render(
    <Provider store={store}>
      <SpouseInfo />
    </Provider>
    )

    screen.getByRole('button', {
      name: /Add/
    })

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

    screen.getByText('First Name and Initial')
    screen.getByText('Last Name')
    screen.getByText('SSN / TIN')

    screen.getByRole('button', {
      name: /Add/
    })

    screen.getByRole('button', {
      name: /Close/
    })
  })

  it('saves a spouse when all fields are entered', async () => {
    render(
    <Provider store={store}>
      <SpouseInfo />
    </Provider>
    )

    const addButton = screen.getByRole('button', {
      name: /Add/
    })

    fireEvent.click(addButton)

    const createButton = screen.getByRole('button', {
      name: /Add/
    })

    screen.getByRole('button', {
      name: /Close/
    })

    const inputs = screen.getAllByRole('textbox')
    const [firstNameInput, lastNameInput, ssidInput] = inputs

    userEvent.type(firstNameInput, 'Sally K')
    userEvent.type(lastNameInput, 'Ride')
    fireEvent.change(ssidInput, { target: { value: '123456789' } })

    fireEvent.click(createButton)

    await screen.findByText('Sally K Ride')
    screen.getByText('123456789')

    const editButton = screen.getByLabelText('edit')

    fireEvent.click(editButton)

    expect(editButton).not.toBeInTheDocument()

    const filledInputs = await screen.findAllByRole('textbox')
    const [filledFirstName, filledLastName, filledSsid] = filledInputs as HTMLInputElement[]

    expect(filledFirstName.value).toBe('Sally K')
    expect(filledLastName.value).toBe('Ride')
    expect(filledSsid.value).toBe('123-45-6789')
  })
})
