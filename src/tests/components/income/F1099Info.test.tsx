import F1099Info from 'ustaxes/components/income/F1099Info'
import { fireEvent, screen, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { InfoStore, createStoreUnpersisted } from 'ustaxes/redux/store'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import {
  FilingStatus,
  Income1099Type,
  Information,
  PersonRole,
  IncomeW2
} from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import { setupUserEvent, type UserEvent } from 'ustaxes/tests/userEventSetup'
import { renderWithProviders } from 'ustaxes/testUtil'

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const labelMatcher = (labelText: string | RegExp): RegExp =>
  typeof labelText === 'string'
    ? new RegExp(escapeRegExp(labelText))
    : labelText

const testW2sSpouse: IncomeW2 = {
  employer: { EIN: '111111111', employerName: 'w2s employer name' },
  personRole: PersonRole.SPOUSE,
  occupation: 'w2s-occupation',
  state: 'AL',
  income: 111,
  medicareIncome: 222,
  fedWithholding: 333,
  ssWages: 111,
  ssWithholding: 444,
  medicareWithholding: 555,
  stateWages: 666,
  stateWithholding: 777
}

const testInformationState: Information = {
  ...blankState,
  f1099s: [
    {
      payer: 'payer-name',
      type: Income1099Type.INT,
      form: { income: 1111111 },
      personRole: PersonRole.PRIMARY
    }
  ],
  w2s: [testW2sSpouse],
  estimatedTaxes: [],
  realEstate: [],
  taxPayer: {
    primaryPerson: {
      address: {
        address: '0001',
        aptNo: '',
        city: 'AR city',
        state: 'AR',
        zip: '1234567'
      },
      firstName: 'payer-first-name',
      lastName: 'payer-last-name',
      isTaxpayerDependent: false,
      role: PersonRole.PRIMARY,
      ssid: '111111111',
      dateOfBirth: new Date('01/01/1970'),
      isBlind: false
    },
    spouse: {
      firstName: 'spouse-first-name',
      isTaxpayerDependent: false,
      lastName: 'spouse-last-name',
      role: PersonRole.SPOUSE,
      ssid: '222222222',
      dateOfBirth: new Date('01/01/1970'),
      isBlind: false
    },
    dependents: [],
    filingStatus: FilingStatus.MFS
  },
  questions: {},
  f1098s: [],
  f1098es: [],
  stateResidencies: [{ state: 'AL' }],
  healthSavingsAccounts: []
}

describe('F1099Info', () => {
  afterEach(async () => {
    await waitFor(() => localStorage.clear())
    jest.resetAllMocks()
  })

  const setup = (
    info: Information | undefined = blankState
  ): {
    store: InfoStore
    labelTextChange: (labelText: string | RegExp, input: string) => void
    selectOption: (labelText: string | RegExp, input: string) => void
    buttonClick: (buttonText: string) => Promise<void>
    user: UserEvent
  } => {
    const store = createStoreUnpersisted(info)
    const navButtons = <PagerButtons submitText="Save and Continue" />
    const user = setupUserEvent()

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance: jest.fn(), navButtons }}>
          <F1099Info />
        </PagerContext.Provider>
      </Provider>
    )

    const labelTextChange = (labelText: string | RegExp, input: string) => {
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

    const buttonClick = async (buttonText: string, index = 0) => {
      await user.click(screen.getAllByText(buttonText)[index])
    }

    return { store, labelTextChange, selectOption, buttonClick, user }
  }

  describe('validations work', () => {
    it('shows empty error messages', async () => {
      const { buttonClick } = setup()

      await buttonClick('Add')
      await buttonClick('Save')

      await waitFor(() => {
        expect(screen.getAllByText('Make a selection')).toHaveLength(2)
        expect(screen.getAllByText('Input is required')).toHaveLength(1)
      })
    })

    it('Payer name', async () => {
      const { labelTextChange, buttonClick } = setup()

      await buttonClick('Add')
      labelTextChange('Enter name of bank, broker firm, or other payer', '')
      await buttonClick('Save')

      await waitFor(() =>
        expect(screen.getByText('Input is required')).toBeInTheDocument()
      )
    })

    it('Form Type', async () => {
      const { selectOption, buttonClick } = setup()

      await buttonClick('Add')
      selectOption('Form Type', '1099-B')
      await buttonClick('Save')
    })

    it('Recipient', async () => {
      const { selectOption, buttonClick } = setup()

      await buttonClick('Add')
      selectOption('Recipient', 'John')
      await buttonClick('Save')
    })

    it('saves information', async () => {
      const { labelTextChange, selectOption, buttonClick } =
        setup(testInformationState)

      await buttonClick('Add')

      selectOption('Form Type', '1099-B')
      labelTextChange(
        'Enter name of bank, broker firm, or other payer',
        'payer-name'
      )
      selectOption(/Recipient/, 'John')

      await buttonClick('Save')

      await waitFor(() => {
        expect(screen.getByText('1099-B')).toBeInTheDocument()
      })
    })

    it('updates information', async () => {
      const { labelTextChange, selectOption, buttonClick, user } =
        setup(testInformationState)

      await user.click(screen.getAllByRole('button')[0])

      selectOption('Form Type', '1099-B')
      labelTextChange(
        'Enter name of bank, broker firm, or other payer',
        'payer-name'
      )
      selectOption(/Recipient/, 'John')

      await buttonClick('Save')

      await waitFor(() => {
        expect(screen.getByText('1099-B')).toBeInTheDocument()
      })
    })

    it('saves an in-progress 1099-NEC draft when Save and Continue is clicked', async () => {
      const onAdvance = jest.fn()
      const store = createStoreUnpersisted(testInformationState)
      const navButtons = <PagerButtons submitText="Save and Continue" />
      const user = setupUserEvent()

      renderWithProviders(
        <Provider store={store}>
          <PagerContext.Provider value={{ onAdvance, navButtons }}>
            <F1099Info />
          </PagerContext.Provider>
        </Provider>
      )

      await user.click(screen.getByText('Add'))

      act(() => {
        fireEvent.change(screen.getByLabelText(labelMatcher('Form Type')), {
          target: { value: Income1099Type.NEC }
        })
      })

      await waitFor(() => {
        expect(
          screen.getByLabelText(labelMatcher(/Nonemployee compensation/i))
        ).toBeInTheDocument()
      })

      act(() => {
        fireEvent.change(
          screen.getByLabelText(
            labelMatcher('Enter name of bank, broker firm, or other payer')
          ),
          {
            target: { value: 'Gig Client' }
          }
        )
        fireEvent.change(screen.getByLabelText(labelMatcher(/Recipient/)), {
          target: { value: PersonRole.PRIMARY }
        })
        fireEvent.change(
          screen.getByLabelText(labelMatcher(/Nonemployee compensation/i)),
          {
            target: { value: '6400' }
          }
        )
      })

      await user.click(
        screen.getByRole('button', { name: 'Save and Continue' })
      )

      await waitFor(() => {
        const state = store.getState()
        expect(state[state.activeYear].f1099s.at(-1)).toMatchObject({
          payer: 'Gig Client',
          type: Income1099Type.NEC,
          personRole: PersonRole.PRIMARY,
          form: {
            nonemployeeCompensation: 6400
          }
        })
      })

      expect(onAdvance).toHaveBeenCalledTimes(1)
    })
  })
})
