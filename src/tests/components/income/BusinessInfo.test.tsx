import { fireEvent, screen, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { InfoStore, createStoreUnpersisted } from 'ustaxes/redux/store'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { Information } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import BusinessInfo from 'ustaxes/components/income/BusinessInfo'
import { setupUserEvent, type UserEvent } from 'ustaxes/tests/userEventSetup'
import { renderWithProviders } from 'ustaxes/testUtil'

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const labelMatcher = (labelText: string | RegExp): RegExp =>
  typeof labelText === 'string'
    ? new RegExp(escapeRegExp(labelText))
    : labelText

describe('BusinessInfo', () => {
  afterEach(async () => {
    await waitFor(() => localStorage.clear())
    jest.resetAllMocks()
  })

  const setup = (
    info: Information = blankState
  ): {
    store: InfoStore
    changeByLabelText: (labelText: string | RegExp, input: string) => void
    selectOption: (labelText: string | RegExp, input: string) => void
    clickButton: (buttonText: string) => Promise<void>
    user: UserEvent
  } => {
    const store = createStoreUnpersisted(info)
    const navButtons = <PagerButtons submitText="Save and Continue" />
    const user = setupUserEvent()

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance: jest.fn(), navButtons }}>
          <BusinessInfo />
        </PagerContext.Provider>
      </Provider>
    )

    const changeByLabelText = (labelText: string | RegExp, input: string) => {
      act(() => {
        fireEvent.change(screen.getByLabelText(labelMatcher(labelText)), {
          target: { value: input }
        })
      })
    }

    const selectOption = (
      labelText: string | RegExp,
      input: string,
      index = 0
    ) => {
      act(() => {
        fireEvent.change(
          screen.getAllByLabelText(labelMatcher(labelText))[index],
          {
            target: { value: input }
          }
        )
      })
    }

    const clickButton = async (buttonText: string, index = 0) => {
      await user.click(screen.getAllByText(buttonText)[index])
    }

    return { store, changeByLabelText, selectOption, clickButton, user }
  }

  it('saves Schedule C business income and expense fields', async () => {
    const { store, changeByLabelText, selectOption, clickButton } = setup()

    await clickButton('Add')

    changeByLabelText('Business name', 'Side Gig')
    changeByLabelText('Principal business or profession (Line A)', 'Consulting')
    changeByLabelText('Address', '123 Main St')
    changeByLabelText('City', 'Austin')
    selectOption('State', 'TX')
    changeByLabelText('Zip', '78701')
    changeByLabelText('Gross receipts or sales (line 1)', '12000')
    changeByLabelText('Returns and allowances (line 2)', '500')
    changeByLabelText('Other income (line 6)', '250')
    changeByLabelText('Advertising (line 8)', '300')
    changeByLabelText('Office expense (line 18)', '450')
    changeByLabelText('Other expense type', 'Software')
    changeByLabelText('Other expenses (line 27a)', '125')
    changeByLabelText('Home office deduction (line 30)', '750')

    await clickButton('Save')

    await waitFor(() => {
      const state = store.getState()
      const business = state[state.activeYear].businesses?.at(-1)
      const selfEmployedIncome =
        state[state.activeYear].selfEmployedIncome?.at(-1)
      expect(screen.getByText('Side Gig')).toBeInTheDocument()
      expect(business).toMatchObject({
        name: 'Side Gig',
        principalBusinessOrProfession: 'Consulting',
        income: {
          grossReceipts: 12000,
          returnsAndAllowances: 500,
          otherIncome: 250
        },
        expenses: {
          advertising: 300,
          office: 450,
          other: 125
        },
        otherExpenseType: 'Software',
        otherExpenseAmount: 125,
        homeOfficeDeduction: 750
      })
      expect(selfEmployedIncome).toMatchObject({
        businessName: 'Side Gig',
        personRole: 'PRIMARY',
        grossReceipts: 11750,
        expenses: 1625
      })
    })
  })
})
