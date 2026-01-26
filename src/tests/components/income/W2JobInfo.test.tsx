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
} from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import W2JobInfo from 'ustaxes/components/income/W2JobInfo'
import { setupUserEvent, type UserEvent } from 'ustaxes/tests/userEventSetup'

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const labelMatcher = (labelText: string | RegExp): RegExp =>
  typeof labelText === 'string'
    ? new RegExp(escapeRegExp(labelText))
    : labelText

jest.mock('redux-persist', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const real = jest.requireActual('redux-persist')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...real,
    persistReducer: jest
      .fn()
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
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
  ssWages: 111,
  ssWithholding: 444,
  medicareWithholding: 555,
  stateWages: 666,
  stateWithholding: 777
}

const testInfo: Information = {
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
  stateResidencies: [{ state: 'AL' }]
}

const errors = {
  inputRequired: () => screen.queryAllByText('Input is required'),
  selectionRequired: () => screen.queryAllByText('Make a selection'),
  inputWordFormat: () =>
    screen.queryAllByText('Input should only include letters and spaces'),
  einFormat: () =>
    screen.queryAllByText('Input should be filled with 9 digits'),
  all: () => {
    // just a moment
  }
}
errors.all = () => [
  ...errors.inputRequired(),
  ...errors.selectionRequired(),
  ...errors.inputWordFormat(),
  ...errors.einFormat()
]

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
    clickButton: (buttonText: string) => Promise<void>
    user: UserEvent
  } => {
    const store = createStoreUnpersisted(info)
    const navButtons = <PagerButtons submitText="Save and Continue" />
    const user = setupUserEvent()

    render(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance: jest.fn(), navButtons }}>
          <W2JobInfo />
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

  describe('validations work', () => {
    it('shows empty error messages', async () => {
      const { clickButton } = setup()

      await clickButton('Add')
      await clickButton('Save')

      await waitFor(() => {
        expect(errors.inputRequired()).toHaveLength(11)
        expect(errors.selectionRequired()).toHaveLength(2)
      })
    })

    it('Employer name can be any string', async () => {
      const { changeByLabelText, clickButton } = setup()

      await clickButton('Add')
      changeByLabelText('Employer name', '123')
      await clickButton('Save')

      await waitFor(() => expect(errors.inputWordFormat()).toHaveLength(0))
    })

    it('Employers Identification Number', async () => {
      const { changeByLabelText, clickButton } = setup()

      await clickButton('Add')
      changeByLabelText(/Employer's Identification Number/, '123')
      await clickButton('Save')

      await waitFor(() => expect(errors.einFormat()).toHaveLength(1))
    })

    it('Occupation', async () => {
      const { changeByLabelText, clickButton } = setup()

      await clickButton('Add')
      changeByLabelText('Occupation', '123')
      await clickButton('Save')

      await waitFor(() => expect(errors.inputWordFormat()).toHaveLength(1))
    })
  })

  it('shows spouse W2 message', () => {
    setup(testInfo)

    expect(
      screen.getByText(/Filing status is set to Married Filing Separately./)
    )
  })

  it('saves information', async () => {
    const { changeByLabelText, selectOption, clickButton } = setup(testInfo)

    await clickButton('Add')

    changeByLabelText('Employer name', 'test employer')
    changeByLabelText(/Employer's Identification Number/, '111111111')
    changeByLabelText('Occupation', 'test occupation')
    changeByLabelText(/Wages, tips, other compensation/, '123456')
    changeByLabelText(/Federal income tax withheld/, '3333')
    changeByLabelText(/Social security wages/, '12345')
    changeByLabelText(/Social security tax withheld/, '4444')
    changeByLabelText(/Medicare Income/, '5555')
    changeByLabelText(/Medicare tax withheld/, '6666')
    changeByLabelText(/State wages, tips, etc/, '7777')
    changeByLabelText(/State income tax/, '8888')
    selectOption('Employee', 'PRIMARY')
    selectOption(/State/, 'AL')

    await clickButton('Save')

    await waitFor(() => {
      expect(screen.getByText('test employer')).toBeInTheDocument()
      expect(screen.getByText('$123,456')).toBeInTheDocument()
    })
  })

  it('removes item of list', async () => {
    if (testW2sSpouse.employer?.employerName) {
      const { user } = setup(testInfo)

      expect(
        screen.getByText(testW2sSpouse.employer.employerName)
      ).toBeInTheDocument()

      await user.click(screen.getAllByRole('button')[1])

      await waitFor(() =>
        expect(screen.queryByText('w2s employer name')).not.toBeInTheDocument()
      )
    }
  })

  it('sets current information when editing', async () => {
    const { user } = setup(testInfo)

    await user.click(screen.getAllByRole('button')[0])

    expect(screen.getByLabelText(labelMatcher('Employer name'))).toHaveValue(
      testW2sSpouse.employer?.employerName
    )
    expect(
      screen.getByLabelText(labelMatcher(/Employer's Identification Number/))
    ).toHaveValue(
      (testW2sSpouse.employer?.EIN?.slice(0, 2) ?? '') +
        '-' +
        (testW2sSpouse.employer?.EIN?.slice(2) ?? '')
    )
    expect(screen.getByLabelText(labelMatcher('Occupation'))).toHaveValue(
      testW2sSpouse.occupation
    )
    expect(
      screen.getByLabelText(labelMatcher(/Wages, tips, other compensation/))
    ).toHaveValue(testW2sSpouse.income.toLocaleString('en-US'))
    expect(
      screen.getByLabelText(labelMatcher(/Social security tax withheld/))
    ).toHaveValue(testW2sSpouse.ssWithholding.toLocaleString('en-US'))
    expect(screen.getByLabelText(labelMatcher(/Medicare Income/))).toHaveValue(
      testW2sSpouse.medicareIncome.toLocaleString('en-US')
    )
    expect(
      screen.getByLabelText(labelMatcher(/Medicare tax withheld/))
    ).toHaveValue(testW2sSpouse.medicareWithholding.toLocaleString('en-US'))
    expect(screen.getAllByLabelText(/State/)[0]).toHaveValue(
      testW2sSpouse.state
    )
    expect(
      screen.getByLabelText(labelMatcher(/State wages, tips, etc/))
    ).toHaveValue(testW2sSpouse.stateWages?.toLocaleString('en-US'))
    expect(screen.getByLabelText(labelMatcher(/State income tax/))).toHaveValue(
      testW2sSpouse.stateWithholding?.toLocaleString('en-US')
    )
    expect(screen.getByLabelText(labelMatcher('Employee'))).toHaveValue(
      testW2sSpouse.personRole
    )
  })

  it('updates information', async () => {
    const { changeByLabelText, selectOption, clickButton, user } =
      setup(testInfo)

    await user.click(screen.getAllByRole('button')[0])

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

    await clickButton('Save')

    await waitFor(() => {
      expect(screen.getByText('updated employer name')).toBeInTheDocument()
      expect(screen.getByText('$8,888')).toBeInTheDocument()
    })
  })
})
