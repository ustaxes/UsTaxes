/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { store } from 'ustaxes/redux/store'
import log from 'ustaxes/core/log'
import { SpouseTestPage } from './Pages'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

beforeEach(() => {
  log.setLevel(log.levels.TRACE)
})

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

describe('DatePicker in spouse form', () => {
  it('Datepicker input should be testable', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const spouse = spousePage.spouse

    userEvent.click(spouse.addButton()!)

    // initial state has an add button
    await waitFor(() => expect(spouse.dateOfBirthField()).toBeInTheDocument())
    expect(spouse.dateOfBirthErrors()).toHaveLength(0)

    userEvent.type(spouse.dateOfBirthField()!, '01/01/2000')

    // Value is not immediately updated, has to be awaited after typing
    await waitFor(() =>
      expect(spouse.dateOfBirthField()!.value).toBe('01/01/2000')
    )
    await waitFor(() => expect(spouse.dateOfBirthErrors()).toHaveLength(0))

    spousePage.cleanup()
  })
})
