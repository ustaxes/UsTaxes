import { waitFor } from '@testing-library/react'
import { FilingStatus, PersonRole, TaxesState } from '../redux/data'
import ScheduleEIC from './ScheduleEIC'
import F1040 from './F1040'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((_, reducers) => reducers)
  }
})

beforeAll(async () =>
  jest.spyOn(console, 'warn').mockImplementation(() => {})
)

describe('ScheduleEIC', () => {
  it('should disallow EIC for no income', () => {
    const model: TaxesState = {
      information: {
        f1099s: [],
        w2s: [],
        taxPayer: {
          filingStatus: FilingStatus.MFJ,
          dependents: [],
          spouse: {
            isTaxpayerDependent: false,
            firstName: 'a',
            lastName: 'b',
            ssid: '123456789',
            role: PersonRole.SPOUSE
          }
        }
      }
    }
    const f1040 = new F1040(model.information.taxPayer)
    model.information.w2s.forEach((w2) => f1040.addW2(w2))

    const eic = new ScheduleEIC(model.information.taxPayer)
    expect(eic.allowed(f1040)).toBe(false)
    expect(eic.credit(f1040)).toBe(0)
  })
})
