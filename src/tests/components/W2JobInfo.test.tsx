import React, { ReactElement } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { useDispatch, Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

import W2JobInfo from '../../components/income/W2JobInfo'
import { store } from '../../redux/store'

import {
  savePrimaryPersonInfo,
  PrimaryPerson,
  Person,
  addSpouse
} from '../../redux/actions'

import { Address, PersonRole } from '../../redux/data'

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

const w2FormLabels: string[] = [
  'Employer name',
  'Occupation',
  'Wages, tips, other compensation',
  'Federal income tax withheld',
  'Social security tax withheld',
  'Medicare tax withheld',
  'Employee'
]

describe('W2Info', () => {
  it('renders an `Add` button when no W-2s have been added', async () => {
    render(
      <Provider store={store}>
        <W2JobInfo />
      </Provider>
    )

    // W-2 labels should not be present
    for (const label of w2FormLabels) {
      expect(screen.queryByText(label)).toBeNull()
    }
  })
  it('saves and edits a W-2', () => {
    // Creates, saves test taxpayer and spouse
    const sallyAddress: Address = {
      address: 'Space Commerce Way',
      city: 'Merritt Island'
    }

    const sallyPersonInfo: PrimaryPerson = {
      firstName: 'Sally K',
      lastName: 'Ride',
      ssid: '123-45-6789',
      role: PersonRole.PRIMARY,
      address: sallyAddress,
      isTaxpayerDependent: false
    }

    const tamPersonInfo: Person = {
      firstName: 'Tam E',
      lastName: "O'Shaughnessy",
      ssid: '987-65-4321',
      role: Person
    }

    store.dispatch(savePrimaryPersonInfo(sallyPersonInfo))
    store.dispatch(addSpouse(tamPersonInfo))
    render(
      <Provider store={store}>
        <W2JobInfo />
      </Provider>
    )

    // Add new W-2, expect test taxpayer and spouse on employee drop-down list
    const addButton = screen.getByRole('button', {
      name: /Add/
    })

    userEvent.click(addButton)
    const employeeButton = screen.getByRole('combobox')
    userEvent.click(employeeButton)
    const sallyDisplayName = sallyPersonInfo.firstName + ' ' + sallyPersonInfo.lastName + ' (' + sallyPersonInfo.ssid + ')'
    const tamDisplayName = tamPersonInfo.firstName + ' ' + tamPersonInfo.lastName + ' (' + tamPersonInfo.ssid + ')'
    screen.queryByText(sallyDisplayName)
    screen.queryByText(tamDisplayName)

    // W-2 labels should now be present
    for (const label of w2FormLabels) {
      screen.queryByText(label)
    }

    const inputs = screen.getAllByRole('textbox')
    const [employerInput, occupationInput, incomeInput, fedInput, ssInput, medicareInput] = inputs

    userEvent.type(employerInput, '42')

    const firstNameErrors = await screen.findAllByText(
      'Input should only include letters and spaces'
    )
    expect(firstNameErrors).toHaveLength(1)
    expect(screen.getAllByText('Input is required')).toHaveLength(5)

    const saveButton = screen.getByRole('button', {
      name: /Save/
    })



    screen.getByRole('NotAvailable')

  })
})
