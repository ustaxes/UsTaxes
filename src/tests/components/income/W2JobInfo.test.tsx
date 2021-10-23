import { fireEvent, screen, render, waitFor, act } from '@testing-library/react'
import { Provider } from 'react-redux'
import { InfoStore, createStoreUnpersisted } from 'ustaxes/redux/store'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import {
  FilingStatus,
  Income1099Type,
  PersonRole,
  IncomeW2,
  Information
} from 'ustaxes/redux/data'
import { blankState } from 'ustaxes/redux/reducer'
import W2JobInfo from 'ustaxes/components/income/W2JobInfo'
import userEvent from '@testing-library/user-event'

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest
      .fn()
      .mockImplementation((_config, reducers) => reducers)
  }
})

const testW2sSpouse: IncomeW2 = {
  employer: { EIN: '111111111', employerName: 'w2s employer name' },
  personRole: PersonRole.SPOUSE,
  occupation: 'w2s-occupation',
  state: 'AL',
  income: 111,
  medicareIncome: 222,
  fedWithholding: 333,
  ssWithholding: 444,
  medicareWithholding: 555,
  stateWages: 666,
  stateWithholding: 777
}

const testInfo: Information = {
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
      ssid: '111111111'
    },
    spouse: {
      firstName: 'spouse-first-name',
      isTaxpayerDependent: false,
      lastName: 'spouse-last-name',
      role: PersonRole.SPOUSE,
      ssid: '222222222'
    },
    dependents: [],
    filingStatus: FilingStatus.MFS
  },
  questions: {},
  f1098es: [],
  stateResidencies: [{ state: 'AL' }]
}

describe('W2JobInfo', () => {
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
    clickButton: (buttonText: string) => void
  } => {
    const store = createStoreUnpersisted(info)
    const navButtons = <PagerButtons submitText="Save and Continue" />

    render(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance: jest.fn(), navButtons }}>
          <W2JobInfo />
        </PagerContext.Provider>
      </Provider>
    )

    const changeByLabelText = (labelText: string | RegExp, input: string) => {
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

    const clickButton = (buttonText: string, index = 0) => {
      userEvent.click(screen.getAllByText(buttonText)[index])
    }

    return { store, changeByLabelText, selectOption, clickButton }
  }

  describe('validations work', () => {
    it('shows empty error messages', async () => {
      const { clickButton } = setup()

      clickButton('Add')
      clickButton('Save')

      await waitFor(() => {
        expect(screen.getAllByText('Input is required')).toHaveLength(8)
        expect(screen.getAllByText('Make a selection')).toHaveLength(2)
      })
    })

    it('Employer name', async () => {
      const { changeByLabelText, clickButton } = setup()

      clickButton('Add')
      changeByLabelText('Employer name', '123')
      clickButton('Save')

      await waitFor(() =>
        expect(
          screen.getByText('Input should only include letters and spaces')
        ).toBeInTheDocument()
      )
    })

    it('Employers Identification Number', async () => {
      const { changeByLabelText, clickButton } = setup()

      clickButton('Add')
      changeByLabelText(/Employer's Identification Number/, '123')
      clickButton('Save')

      await waitFor(() =>
        expect(
          screen.getByText('Input should be filled with 9 digits')
        ).toBeInTheDocument()
      )
    })

    it('Occupation', async () => {
      const { changeByLabelText, clickButton } = setup()

      clickButton('Add')
      changeByLabelText('Occupation', '123')
      clickButton('Save')

      await waitFor(() =>
        expect(
          screen.getByText('Input should only include letters and spaces')
        ).toBeInTheDocument()
      )
    })
  })

  it('shows spouse W2 message', async () => {
    setup(testInfo)

    expect(
      screen.getByText(/Filing status is set to Married Filing Separately./)
    )
  })

  it('saves information', async () => {
    const { changeByLabelText, selectOption, clickButton } = setup(testInfo)

    clickButton('Add')

    changeByLabelText('Employer name', 'test employer')
    changeByLabelText(/Employer's Identification Number/, '111111111')
    changeByLabelText('Occupation', 'test occupation')
    changeByLabelText(/Wages, tips, other compensation/, '2222')
    changeByLabelText(/Federal income tax withheld/, '3333')
    changeByLabelText(/Social security tax withheld/, '4444')
    changeByLabelText(/Medicare Income/, '5555')
    changeByLabelText(/Medicare tax withheld/, '6666')
    changeByLabelText(/State wages, tips, etc/, '7777')
    changeByLabelText(/State income tax/, '8888')
    selectOption('Employee', 'PRIMARY')
    selectOption(/State/, 'AL')

    clickButton('Save')

    await waitFor(() => {
      expect(screen.getByText('test employer')).toBeInTheDocument()
      expect(screen.getByText('$2,222')).toBeInTheDocument()
    })
  })

  it('removes item of list', async () => {
    if (testW2sSpouse.employer?.employerName) {
      setup(testInfo)

      expect(
        screen.getByText(testW2sSpouse.employer.employerName)
      ).toBeInTheDocument()

      userEvent.click(screen.getAllByRole('button')[1])

      await waitFor(() =>
        expect(screen.queryByText('w2s employer name')).not.toBeInTheDocument()
      )
    }
  })

  it('sets current information when editing', () => {
    setup(testInfo)

    userEvent.click(screen.getAllByRole('button')[0])

    expect(screen.getByLabelText('Employer name')).toHaveValue(
      testW2sSpouse.employer?.employerName
    )
    expect(
      screen.getByLabelText(/Employer's Identification Number/)
    ).toHaveValue(
      testW2sSpouse.employer?.EIN?.slice(0, 2) +
        '-' +
        testW2sSpouse.employer?.EIN?.slice(2)
    )
    expect(screen.getByLabelText('Occupation')).toHaveValue(
      testW2sSpouse.occupation
    )
    expect(
      screen.getByLabelText(/Wages, tips, other compensation/)
    ).toHaveValue(testW2sSpouse.income.toLocaleString('en-US'))
    expect(screen.getByLabelText(/Social security tax withheld/)).toHaveValue(
      testW2sSpouse.ssWithholding.toLocaleString('en-US')
    )
    expect(screen.getByLabelText(/Medicare Income/)).toHaveValue(
      testW2sSpouse.medicareIncome.toLocaleString('en-US')
    )
    expect(screen.getByLabelText(/Medicare tax withheld/)).toHaveValue(
      testW2sSpouse.medicareWithholding.toLocaleString('en-US')
    )
    expect(screen.getAllByLabelText(/State/)[0]).toHaveValue(
      testW2sSpouse.state
    )
    expect(screen.getByLabelText(/State wages, tips, etc/)).toHaveValue(
      testW2sSpouse.stateWages?.toLocaleString('en-US')
    )
    expect(screen.getByLabelText(/State income tax/)).toHaveValue(
      testW2sSpouse.stateWithholding?.toLocaleString('en-US')
    )
    expect(screen.getByLabelText('Employee')).toHaveValue(
      testW2sSpouse.personRole
    )
  })

  it('updates information', async () => {
    const { changeByLabelText, selectOption, clickButton } = setup(testInfo)

    userEvent.click(screen.getAllByRole('button')[0])

    changeByLabelText('Employer name', 'updated employer name')
    changeByLabelText(/Employer's Identification Number/, '999999999')
    changeByLabelText('Occupation', 'updated occupation')
    changeByLabelText(/Wages, tips, other compensation/, '8888')
    changeByLabelText(/Federal income tax withheld/, '7777')
    changeByLabelText(/Social security tax withheld/, '6666')
    changeByLabelText(/Medicare Income/, '5555')
    changeByLabelText(/Medicare tax withheld/, '4444')
    changeByLabelText(/State wages, tips, etc/, '3333')
    changeByLabelText(/State income tax/, '2222')
    selectOption('Employee', 'SPOUSE')
    selectOption(/State/, 'AR')

    clickButton('Save')

    await waitFor(() => {
      expect(screen.getByText('updated employer name')).toBeInTheDocument()
      expect(screen.getByText('$8,888')).toBeInTheDocument()
    })
  })
})
