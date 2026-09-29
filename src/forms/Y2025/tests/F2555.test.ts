import { FilingStatus, Information, PersonRole } from 'ustaxes/core/data'
import { run } from 'ustaxes/core/util'
import { insertFormDataToPdfs } from 'ustaxes/core/irsForms'
import { localPDFs } from 'ustaxes/core/tests/LocalForms'
import { validate } from 'ustaxes/forms/F1040Base'
import { yearFormBuilder } from 'ustaxes/forms/YearForms'
import { blankState } from 'ustaxes/redux/reducer'
import F1040 from '../irsForms/F1040'

const buildInfo = (): Information => ({
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
  },
  otherIncome: {
    foreignEarnedIncomeExclusion: 4321
  }
})

describe('Form 2555', () => {
  it('fills identifying fields and line 45 from saved FEIE data', () => {
    const info = buildInfo()

    const f1040 = run(validate(info)).fold(
      (errors) => {
        throw new Error(`Validation failed: ${String(errors)}`)
      },
      (validInfo) => new F1040(validInfo, [])
    )

    const fields = f1040.f2555?.fields()

    expect(fields?.[0]).toBe('Pat Boling')
    expect(fields?.[1]).toBe('123456789')
    expect(fields?.[122]).toBe(4321)
  })

  it('includes Form 2555 in the federal attachment list and fills its PDF', async () => {
    const info: Information = {
      ...buildInfo(),
      selfEmployedIncome: [
        {
          businessName: 'Side Gig',
          personRole: PersonRole.PRIMARY,
          grossReceipts: 12000,
          expenses: 2000,
          healthInsurancePremiums: 17820
        }
      ],
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          line1: 17820,
          line4: 10000,
          line5: 10000,
          line9: 0,
          line12: 4321
        },
        selfEmployedHealthInsuranceDeduction: 5679
      }
    }

    const f1040 = run(validate(info)).fold(
      (errors) => {
        throw new Error(`Validation failed: ${String(errors)}`)
      },
      (validInfo) => new F1040(validInfo, [])
    )

    const tags = f1040.schedules().map((form) => form.tag)

    expect(tags).toContain('f2555')
    expect(tags).toContain('f7206')
    expect(tags).toContain('f1040sc')

    const pdfs = await insertFormDataToPdfs(
      f1040.schedules(),
      localPDFs('Y2025')
    )

    expect(pdfs.length).toBeGreaterThan(0)
  })

  it('builds federal PDFs and bytes through YearForms for the FEIE + 7206 flow', async () => {
    const info: Information = {
      ...buildInfo(),
      selfEmployedIncome: [
        {
          businessName: 'Side Gig',
          personRole: PersonRole.PRIMARY,
          grossReceipts: 12000,
          expenses: 2000,
          healthInsurancePremiums: 17820
        }
      ],
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          line1: 17820,
          line4: 10000,
          line5: 10000,
          line9: 0,
          line12: 4321
        },
        selfEmployedHealthInsuranceDeduction: 5679
      }
    }

    const builder = yearFormBuilder('Y2025')
      .setDownloader(localPDFs('Y2025'))
      .build(info, [])

    const forms = run(builder.f1040()).fold(
      (errors) => {
        throw new Error(`F1040 creation failed: ${String(errors)}`)
      },
      (createdForms) => createdForms
    )

    expect(forms.map((form) => form.tag)).toEqual(
      expect.arrayContaining(['f1040', 'f2555', 'f7206', 'f1040sc'])
    )

    const pdfResult = await builder.f1040Pdfs()
    const pdfs = run(pdfResult).fold(
      (errors) => {
        throw new Error(`PDF creation failed: ${String(errors)}`)
      },
      (createdPdfs) => createdPdfs
    )
    expect(pdfs.length).toBe(forms.length)

    const bytesResult = await builder.f1040Bytes()
    const bytes = run(bytesResult).fold(
      (errors) => {
        throw new Error(`PDF byte creation failed: ${String(errors)}`)
      },
      (createdBytes) => createdBytes
    )
    expect(bytes.length).toBeGreaterThan(0)
  })
})
