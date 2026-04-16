import { screen, waitFor } from '@testing-library/react'
import { ReactElement } from 'react'
import CreatePDF from 'ustaxes/components/CreatePDF'
import { Information, FilingStatus, PersonRole } from 'ustaxes/core/data'
import { F1040Error } from 'ustaxes/forms/errors'
import yearFormBuilder from 'ustaxes/forms/YearForms'
import { run } from 'ustaxes/core/util'
import { blankState } from 'ustaxes/redux/reducer'
import { FakePagerProvider, PagerMethods } from '../common/FakePager'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as fc from 'fast-check'
import TestPage from '../common/Page'
import { blankYearTaxesState, YearsTaxesState } from 'ustaxes/redux'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.setTimeout(10000)

export default class CreatePDFTestPage extends TestPage {
  pager: PagerMethods
  constructor(state: YearsTaxesState) {
    super(state)
    this.pager = new PagerMethods(() => this.rendered().container, this.user)
  }

  component: ReactElement = (
    <FakePagerProvider>
      <CreatePDF />
    </FakePagerProvider>
  )
}

export const tests = {
  incompleteData: async ({ pager }: CreatePDFTestPage): Promise<void> => {
    await waitFor(() => expect(pager.saveButton()).toBeInTheDocument())

    await pager.save()
  }
}

describe('CreatePDF Page', () => {
  const taxpayerComponent = (
    information: Information = blankState,
    activeYear: 'Y2020' | 'Y2025' = 'Y2020'
  ) =>
    new CreatePDFTestPage({
      ...blankYearTaxesState,
      [activeYear]: information,
      activeYear
    })

  const taxpayerBaseInfo: Information = {
    ...blankState,
    taxPayer: {
      filingStatus: FilingStatus.S,
      primaryPerson: {
        firstName: 'Pat',
        lastName: 'Boling',
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
    }
  }

  const federalSummaryNumbers = (
    info: Information
  ): { refundAmount: number; amountOwed: number } => {
    const builder = yearFormBuilder('Y2025', info, [])
    const forms = run(builder.f1040()).fold(
      (errors) => {
        throw new Error(`F1040 creation failed: ${String(errors)}`)
      },
      (createdForms) => createdForms
    )
    const f1040 = forms.find((form) => form.tag === 'f1040')
    if (f1040 === undefined) {
      throw new Error('Expected F1040 to be present')
    }
    return {
      refundAmount: (f1040 as unknown as { l35a: () => number }).l35a(),
      amountOwed: (f1040 as unknown as { l37: () => number }).l37()
    }
  }

  const amountPattern = (value: number): RegExp => {
    const displayValue =
      value === Math.trunc(value) ? Math.abs(value) : Math.abs(value).toFixed(2)
    const formatted = Number(displayValue).toLocaleString('en-US', {
      minimumFractionDigits: typeof displayValue === 'string' ? 2 : 0,
      maximumFractionDigits: typeof displayValue === 'string' ? 2 : 0
    })
    return new RegExp(`\\$\\s*${formatted.replace(/,/g, '[,]?')}`)
  }

  it('should show no data error if no data is entered', async () => {
    const page = taxpayerComponent()

    await waitFor(() =>
      expect(
        page.rendered().queryByText(F1040Error.filingStatusUndefined)
      ).toBeInTheDocument()
    )

    page.cleanup()
  })

  it('should show filing status error if some data is entered', async () => {
    const information = arbitraries.forYear(2020).information()
    await fc.assert(
      fc.asyncProperty(information, async (info) => {
        const newInfo: Information = info
        newInfo.taxPayer.filingStatus = undefined
        const page = taxpayerComponent(newInfo)

        await waitFor(() =>
          expect(
            page
              .rendered()
              .queryByText(F1040Error.filingStatusRequirementsNotMet)
          ).toBeInTheDocument()
        )

        page.cleanup()
      }),
      { numRuns: 10 }
    )
  })

  it('shows the expected federal refund headline for Y2025', async () => {
    const information: Information = {
      ...taxpayerBaseInfo,
      w2s: [
        {
          employer: { EIN: '111111111', employerName: 'Day Job Inc' },
          personRole: PersonRole.PRIMARY,
          occupation: 'Engineer',
          state: 'TX',
          income: 1000,
          medicareIncome: 1000,
          fedWithholding: 200,
          ssWages: 1000,
          ssWithholding: 62,
          medicareWithholding: 14.5,
          stateWages: 1000,
          stateWithholding: 0
        }
      ]
    }
    const { refundAmount } = federalSummaryNumbers(information)
    const page = taxpayerComponent(information, 'Y2025')
    page.rendered()

    await waitFor(() => {
      expect(screen.getByText(/expected federal refund/i)).toBeInTheDocument()
      expect(refundAmount).toBeGreaterThan(0)
      expect(
        screen.getAllByText(amountPattern(refundAmount)).length
      ).toBeGreaterThan(0)
    })

    page.cleanup()
  })

  it('shows the estimated federal amount owed headline for Y2025', async () => {
    const information: Information = {
      ...taxpayerBaseInfo,
      w2s: [
        {
          employer: { EIN: '111111111', employerName: 'Day Job Inc' },
          personRole: PersonRole.PRIMARY,
          occupation: 'Engineer',
          state: 'TX',
          income: 50000,
          medicareIncome: 50000,
          fedWithholding: 0,
          ssWages: 50000,
          ssWithholding: 3100,
          medicareWithholding: 725,
          stateWages: 50000,
          stateWithholding: 0
        }
      ]
    }
    const { amountOwed } = federalSummaryNumbers(information)
    const page = taxpayerComponent(information, 'Y2025')
    page.rendered()

    await waitFor(() => {
      expect(
        screen.getByText(/estimated federal amount owed/i)
      ).toBeInTheDocument()
      expect(amountOwed).toBeGreaterThan(0)
      expect(
        screen.getAllByText(amountPattern(amountOwed)).length
      ).toBeGreaterThan(0)
    })

    page.cleanup()
  })
})
