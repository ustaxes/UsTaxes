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
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from 'ustaxes/testUtil'

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
    buttonClick: (buttonText: string) => void
  } => {
    const store = createStoreUnpersisted(info)
    const navButtons = <PagerButtons submitText="Save and Continue" />

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance: jest.fn(), navButtons }}>
          <F1099Info />
        </PagerContext.Provider>
      </Provider>
    )

    const labelTextChange = (labelText: string | RegExp, input: string) => {
      act(() => {
        fireEvent.change(screen.getByLabelText(labelText), {
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
        fireEvent.change(screen.getAllByLabelText(labelText)[index], {
          target: { value: input }
        })
      })
    }

    const buttonClick = (buttonText: string, index = 0) => {
      userEvent.click(screen.getAllByText(buttonText)[index])
    }

    return { store, labelTextChange, selectOption, buttonClick }
  }

  describe('validations work', () => {
    it('shows empty error messages', async () => {
      const { buttonClick } = setup()

      buttonClick('Add')
      buttonClick('Save')

      await waitFor(() => {
        expect(screen.getAllByText('Make a selection')).toHaveLength(2)
        expect(screen.getAllByText('Input is required')).toHaveLength(1)
      })
    })

    it('Payer name', async () => {
      const { labelTextChange, buttonClick } = setup()

      buttonClick('Add')
      labelTextChange('Enter name of bank, broker firm, or other payer', '')
      buttonClick('Save')

      await waitFor(() =>
        expect(screen.getByText('Input is required')).toBeInTheDocument()
      )
    })

    it('Form Type', () => {
      const { selectOption, buttonClick } = setup()

      buttonClick('Add')
      selectOption('Form Type', '1099-B')
      buttonClick('Save')
    })

    it('Recipient', () => {
      const { selectOption, buttonClick } = setup()

      buttonClick('Add')
      selectOption('Recipient', 'John')
      buttonClick('Save')
    })

    it('saves information', async () => {
      const { labelTextChange, selectOption, buttonClick } =
        setup(testInformationState)

      buttonClick('Add')

      selectOption('Form Type', '1099-B')
      labelTextChange(
        'Enter name of bank, broker firm, or other payer',
        'payer-name'
      )
      selectOption(/Recipient/, 'John')

      buttonClick('Save')

      await waitFor(() => {
        expect(screen.getByText('1099-B')).toBeInTheDocument()
      })
    })

    it('updates information', async () => {
      const { labelTextChange, selectOption, buttonClick } =
        setup(testInformationState)

      userEvent.click(screen.getAllByRole('button')[0])

      selectOption('Form Type', '1099-B')
      labelTextChange(
        'Enter name of bank, broker firm, or other payer',
        'payer-name'
      )
      selectOption(/Recipient/, 'John')

      buttonClick('Save')

      await waitFor(() => {
        expect(screen.getByText('1099-B')).toBeInTheDocument()
      })
    })
  })
})
