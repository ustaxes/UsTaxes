import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import Main from 'ustaxes/components/Main'
import {
  FilingStatus,
  Income1099Type,
  Information,
  PersonRole
} from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import { blankYearTaxesState, YearsTaxesState } from 'ustaxes/redux/data'
import { createWholeStoreUnpersisted } from 'ustaxes/redux/store'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'

jest.setTimeout(20000)

jest.mock('ustaxes/components/debug', () => ({
  StateLoader: () => null
}))

const baseInformation: Information = {
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
      },
      occupation: 'Engineer'
    },
    contactEmail: 'taylor@example.com',
    contactPhoneNumber: '5551234567',
    dependents: []
  },
  stateResidencies: [{ state: 'TX' }],
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
      expenses: 0,
      healthInsurancePremiums: 775
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

const renderApp = (info: Information) => {
  const state: YearsTaxesState = {
    ...blankYearTaxesState,
    activeYear: 'Y2025',
    Y2025: info
  }
  const store = createWholeStoreUnpersisted(state)

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/start']}>
        <Main />
      </MemoryRouter>
    </Provider>
  )

  return { store }
}

const advanceFromStartToF7206 = async () => {
  const user = setupUserEvent()
  const visitedHeadings: string[] = []

  await user.click(
    screen.getByRole('button', { name: /start return in browser/i })
  )

  for (let i = 0; i < 20; i += 1) {
    const headingText = screen
      .queryAllByRole('heading', { level: 2 })
      .at(0)?.textContent
    if (headingText) {
      visitedHeadings.push(headingText)
    }

    if (
      screen.queryByRole('heading', {
        name: /form 7206 worksheet/i
      })
    ) {
      return user
    }

    await user.click(
      await screen.findByRole('button', { name: /save and continue/i })
    )
  }

  throw new Error(
    `Did not reach Form 7206 Worksheet within 20 steps. Visited: ${visitedHeadings.join(
      ' -> '
    )}`
  )
}

describe('F7206 navigation flow', () => {
  it('retains existing worksheet values when clicking through a prefilled return', async () => {
    renderApp({
      ...baseInformation,
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          line1: 900,
          line4: 10000,
          line14: 775
        },
        selfEmployedHealthInsuranceDeduction: 775
      }
    })

    await advanceFromStartToF7206()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /form 7206 worksheet/i })
      ).toBeInTheDocument()
      expect(screen.getByDisplayValue('900')).toBeInTheDocument()
      expect(screen.getByDisplayValue('10,000')).toBeInTheDocument()
      expect(screen.getByDisplayValue('775')).toBeInTheDocument()
    })
  })

  it('prefills derived line 4 when clicking through a prefilled return with NEC income and no worksheet yet', async () => {
    renderApp(baseInformation)

    await advanceFromStartToF7206()

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /form 7206 worksheet/i })
      ).toBeInTheDocument()
      expect(screen.getByDisplayValue('10,000')).toBeInTheDocument()
      expect(
        screen.getByText(/current schedule c net profit estimate/i)
      ).toBeInTheDocument()
    })
  })
})
