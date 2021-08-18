import React from 'react'
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

import W2JobInfo from '../../components/income/W2JobInfo'
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

const IncomeW2UserInputStrings: string[] = ['Employer name', 'Occupation', 'Wages, tips, other compensation',
  'Federal income tax withheld', 'Social security tax withheld', 'Medicare tax withheld', 'Employee']

describe('W2Info', () => {
  it('renders an `Add` button when no W2s have been added', () => {
    render(
      <Provider store={store}>
        <W2JobInfo />
      </Provider>
    )

    screen.getByRole('button', {
      name: /Add/
    })

    // for(let inputString of IncomeW2UserInputStrings){
    //   let label : any = screen.queryByLabelText(inputString)
    //   expect(label).not.toBeInTheDocument()
    // }

    IncomeW2UserInputStrings.map( inputString => (
      expect(screen.queryByLabelText(inputString)).not.toBeInTheDocument()
    ))})
})