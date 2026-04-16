import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import SelfEmployedHealthInsuranceWorksheetInfo from 'ustaxes/components/deductions/SelfEmployedHealthInsuranceWorksheet'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import {
  FilingStatus,
  Income1099Type,
  Information,
  PersonRole
} from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import { createStoreUnpersisted } from 'ustaxes/redux/store'
import { renderWithProviders } from 'ustaxes/testUtil'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'

describe('SelfEmployedHealthInsuranceWorksheet', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('prefills line 4 from Schedule C when a stored worksheet line 4 value is blank', async () => {
    const info: Information = {
      ...blankState,
      businesses: [
        {
          name: 'Side Gig',
          principalBusinessOrProfession: 'Consulting',
          income: {
            grossReceipts: 12000,
            returnsAndAllowances: 500,
            otherIncome: 250
          },
          expenses: {
            advertising: 300,
            office: 450
          },
          homeOfficeDeduction: 750
        }
      ],
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          line1: 900,
          line4: '' as unknown as number
        }
      }
    }
    const store = createStoreUnpersisted(info)
    const user = setupUserEvent()
    const onAdvance = jest.fn()
    const navButtons = <PagerButtons submitText="Save and Continue" />

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance, navButtons }}>
          <SelfEmployedHealthInsuranceWorksheetInfo />
        </PagerContext.Provider>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('10,250')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    await waitFor(() => {
      const state = store.getState()
      expect(
        state[state.activeYear].adjustments
          ?.selfEmployedHealthInsuranceWorksheet?.line4
      ).toBe(10250)
    })

    expect(onAdvance).toHaveBeenCalledTimes(1)
  })

  it('prefills line 4 from 1099-NEC income when no Schedule C business entries exist', async () => {
    const info: Information = {
      ...blankState,
      taxPayer: {
        filingStatus: FilingStatus.S,
        primaryPerson: {
          firstName: 'Taylor',
          lastName: 'Taxpayer',
          ssid: '123456789',
          role: PersonRole.PRIMARY,
          isBlind: false,
          dateOfBirth: new Date(1990, 0, 1),
          isTaxpayerDependent: false,
          address: {
            address: '123 Maple St',
            city: 'Austin',
            state: 'TX',
            zip: '78701'
          }
        },
        dependents: []
      },
      f1099s: [
        {
          payer: 'Client Co',
          personRole: PersonRole.PRIMARY,
          type: Income1099Type.NEC,
          form: {
            nonemployeeCompensation: 6400
          }
        }
      ]
    }
    const store = createStoreUnpersisted(info)

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider
          value={{
            onAdvance: jest.fn(),
            navButtons: <PagerButtons submitText="Save and Continue" />
          }}
        >
          <SelfEmployedHealthInsuranceWorksheetInfo />
        </PagerContext.Provider>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('6,400')).toBeInTheDocument()
      expect(
        screen.getByText(/Current Schedule C net profit estimate/i)
      ).toBeInTheDocument()
    })
  })

  it('prefills line 4 for Y2025 when multiple 1099-NECs exist and the business page only has identifying details', async () => {
    const info: Information = {
      ...blankState,
      taxPayer: {
        filingStatus: FilingStatus.S,
        primaryPerson: {
          firstName: 'Taylor',
          lastName: 'Taxpayer',
          ssid: '123456789',
          role: PersonRole.PRIMARY,
          isBlind: false,
          dateOfBirth: new Date(1990, 0, 1),
          isTaxpayerDependent: false,
          address: {
            address: '123 Maple St',
            city: 'Austin',
            state: 'TX',
            zip: '78701'
          }
        },
        dependents: []
      },
      w2s: [
        {
          employer: { EIN: '111111111', employerName: 'Day Job Inc' },
          personRole: PersonRole.PRIMARY,
          occupation: 'Engineer',
          state: 'TX',
          income: 50000,
          medicareIncome: 50000,
          fedWithholding: 4500,
          ssWages: 50000,
          ssWithholding: 3100,
          medicareWithholding: 725,
          stateWages: 50000,
          stateWithholding: 0
        }
      ],
      businesses: [
        {
          name: 'Side Gig',
          principalBusinessOrProfession: 'Consulting',
          address: {
            address: '456 Oak Ave',
            city: 'Austin',
            state: 'TX',
            zip: '78702'
          },
          income: {
            grossReceipts: 0,
            returnsAndAllowances: 0,
            otherIncome: undefined
          },
          expenses: {}
        }
      ],
      selfEmployedIncome: [
        {
          businessName: 'Side Gig',
          personRole: PersonRole.PRIMARY,
          grossReceipts: 0,
          expenses: 0
        }
      ],
      f1099s: [
        {
          payer: 'Client A',
          personRole: PersonRole.PRIMARY,
          type: Income1099Type.NEC,
          form: {
            nonemployeeCompensation: 6400
          }
        },
        {
          payer: 'Client B',
          personRole: PersonRole.PRIMARY,
          type: Income1099Type.NEC,
          form: {
            nonemployeeCompensation: 2500
          }
        },
        {
          payer: 'Client C',
          personRole: PersonRole.PRIMARY,
          type: Income1099Type.NEC,
          form: {
            nonemployeeCompensation: 1100
          }
        }
      ]
    }
    const store = createStoreUnpersisted(info)

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider
          value={{
            onAdvance: jest.fn(),
            navButtons: <PagerButtons submitText="Save and Continue" />
          }}
        >
          <SelfEmployedHealthInsuranceWorksheetInfo />
        </PagerContext.Provider>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('10,000')).toBeInTheDocument()
      expect(
        screen.getByText(/Current Schedule C net profit estimate/i)
      ).toBeInTheDocument()
    })
  })
})
