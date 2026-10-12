import {
  AccountType,
  FilingStatus,
  Information,
  PersonRole
} from 'ustaxes/core/data'
import { isLeft } from 'ustaxes/core/util'
import { create1040 } from '../../irsForms/Main'
import { createStateReturn } from '../../stateForms'
import { localPDFs } from 'ustaxes/core/tests/LocalForms'
import { fillPdfFromFill } from 'ustaxes/core/pdfFiller/fillPdf'
import { blankState } from 'ustaxes/redux/reducer'

/**
 * Fills the real CA PDFs under public/forms/Y2025/states/CA in strict
 * mode, exercising every fill instruction (bad field names or radio
 * indices throw).
 */

const info: Information = {
  ...blankState,
  taxPayer: {
    filingStatus: FilingStatus.MFJ,
    primaryPerson: {
      firstName: 'Test',
      lastName: 'Payer',
      ssid: '123456789',
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: new Date('1980-05-05'),
      isTaxpayerDependent: false,
      address: {
        address: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zip: '90001'
      }
    },
    spouse: {
      firstName: 'Spouse',
      lastName: 'Payer',
      ssid: '987654321',
      role: PersonRole.SPOUSE,
      isBlind: false,
      dateOfBirth: new Date('1982-07-07'),
      isTaxpayerDependent: false
    },
    dependents: [
      {
        firstName: 'Kid',
        lastName: 'Payer',
        ssid: '111223333',
        role: PersonRole.DEPENDENT,
        isBlind: false,
        dateOfBirth: new Date('2015-01-15'),
        relationship: 'Daughter',
        qualifyingInfo: { numberOfMonths: 12, isStudent: false }
      }
    ]
  },
  w2s: [
    {
      occupation: 'Engineer',
      income: 120000,
      medicareIncome: 120000,
      fedWithholding: 18000,
      ssWages: 120000,
      ssWithholding: 7440,
      medicareWithholding: 1740,
      personRole: PersonRole.PRIMARY,
      state: 'CA',
      stateWages: 121000,
      stateWithholding: 7000,
      box12: { W: 1000 }
    },
    {
      occupation: 'Teacher',
      income: 60000,
      medicareIncome: 60000,
      fedWithholding: 6000,
      ssWages: 60000,
      ssWithholding: 3720,
      medicareWithholding: 870,
      personRole: PersonRole.SPOUSE,
      state: 'CA',
      stateWages: 60000,
      stateWithholding: 2500
    }
  ],
  itemizedDeductions: {
    medicalAndDental: 0,
    stateAndLocalTaxes: 12000,
    isSalesTax: false,
    stateAndLocalRealEstateTaxes: 9000,
    stateAndLocalPropertyTaxes: 0,
    interest8a: 14000,
    interest8b: 0,
    interest8c: 0,
    interest8d: 0,
    investmentInterest: 0,
    charityCashCheck: 3000,
    charityOther: 0
  },
  healthSavingsAccounts: [
    {
      label: 'HSA',
      coverageType: 'family',
      contributions: 4000,
      personRole: PersonRole.PRIMARY,
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      totalDistributions: 0,
      qualifiedDistributions: 0
    }
  ],
  dependentCareExpenses: {
    qualifyingPersonCount: 1,
    totalExpenses: 4000
  },
  caStateInfo: {
    qualifiesForRentersCredit: true,
    monthsWithoutHealthCoverage: 3,
    estimatedTaxPayments: 1200
  },
  stateResidencies: [{ state: 'CA' }],
  refund: {
    routingNumber: '122000247',
    accountNumber: '1234567',
    accountType: AccountType.checking
  }
}

describe('CA form fill', () => {
  it('fills every CA PDF in strict mode without warnings', async () => {
    const f1040Result = create1040(info, [])
    if (isLeft(f1040Result)) {
      throw new Error(f1040Result.left.join(';'))
    }
    const [f1040] = f1040Result.right
    const stateResult = createStateReturn(f1040)
    if (isLeft(stateResult)) {
      throw new Error(stateResult.left.join(';'))
    }
    const forms = stateResult.right
    // 540 + Schedule CA + FTB 3853. FTB 3506 is correctly absent:
    // the CA dependent care credit is zero above $100,000 federal AGI.
    expect(forms.map((f) => f.formName).sort()).toEqual([
      '540',
      'FTB3853',
      'ScheduleCA'
    ])

    // Lower-income variant triggers FTB 3506 (dependent care credit)
    const lowIncomeInfo: Information = {
      ...info,
      w2s: info.w2s.map((w2) => ({
        ...w2,
        income: w2.income / 3,
        stateWages: (w2.stateWages ?? 0) / 3
      })),
      itemizedDeductions: undefined
    }
    const lowResult = create1040(lowIncomeInfo, [])
    if (isLeft(lowResult)) {
      throw new Error(lowResult.left.join(';'))
    }
    const lowState = createStateReturn(lowResult.right[0])
    if (isLeft(lowState)) {
      throw new Error(lowState.left.join(';'))
    }
    const allForms = [
      ...forms,
      ...lowState.right.filter((f) => f.formName === 'FTB3506')
    ]
    expect(allForms.map((f) => f.formName)).toContain('FTB3506')

    const download = localPDFs('Y2025')
    for (const form of allForms) {
      const pdf = await download(`states/${form.state}/${form.formName}.pdf`)
      const { warnings } = fillPdfFromFill(
        pdf,
        form.formName,
        form,
        form.renderedFields()
      )
      expect({ form: form.formName, warnings }).toEqual({
        form: form.formName,
        warnings: []
      })
    }
  })
})
