import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'

interface PayerAmount {
  payer?: string
  amount?: number
}

export default class ScheduleB extends F1040Attachment {
  tag: FormTag = 'f1040sb'
  sequenceIndex = 8
  readonly interestPayersLimit = 14
  readonly dividendPayersLimit = 15

  index = 0

  constructor(f1040: F1040, index = 0) {
    super(f1040)
    this.index = index
  }

  copies = (): ScheduleB[] => {
    if (this.index === 0) {
      const numInterestPayers = this.l1Fields().length
      const numDivPayers = this.l5Fields().length

      const extraCopiesNeeded = Math.floor(
        Math.max(
          numInterestPayers / this.interestPayersLimit,
          numDivPayers / this.dividendPayersLimit
        )
      )

      return Array.from(Array(extraCopiesNeeded)).map(
        (_, i) => new ScheduleB(this.f1040, i + 1)
      )
    } else {
      return []
    }
  }

  isNeeded = (): boolean =>
    this.l1Fields().length > 0 || this.l5Fields().length > 0

  l1Fields = (): PayerAmount[] =>
    this.f1040
      .f1099Ints()
      .map((v) => ({
        payer: v.payer,
        amount: v.form.income
      }))
      .concat(
        this.f1040.k1sWithInterest().map((v) => ({
          payer: v.partnershipName,
          amount: v.interestIncome
        }))
      )

  l1 = (): Array<string | undefined> => {
    const payerValues = this.l1Fields().slice(
      this.index * this.interestPayersLimit,
      (this.index + 1) * this.interestPayersLimit
    )
    const rightPad = 2 * (this.interestPayersLimit - payerValues.length)
    // ensure we return an array of length interestPayersLimit * 2.
    // This form may have multiple copies, only display the copies for this form
    return payerValues
      .flatMap(({ payer, amount }) => [payer, amount?.toString()])
      .concat(Array(rightPad).fill(undefined))
  }

  l2 = (): number => sumFields(this.f1040.f1099Ints().map((f) => f.form.income))

  // TODO: Interest from tax exempt savings bonds
  l3 = (): number | undefined => undefined

  l4 = (): number => this.l2() - (this.l3() ?? 0)

  /**
   * Total interest on all schedule Bs.
   */
  to1040l2b = (): number =>
    [this, ...this.copies()].reduce((acc, f) => acc + f.l4(), 0)

  l5Fields = (): PayerAmount[] =>
    this.f1040.f1099Divs().map((v) => ({
      payer: v.payer,
      amount: v.form.dividends
    }))

  l5 = (): Array<string | undefined | number> => {
    const payerValues = this.l5Fields().slice(
      this.index * this.dividendPayersLimit,
      (this.index + 1) * this.dividendPayersLimit
    )

    const rightPad = 2 * (this.dividendPayersLimit - payerValues.length)
    return payerValues
      .flatMap(({ payer, amount }) => [payer, amount])
      .concat(Array(rightPad).fill(undefined))
  }

  l6 = (): number => sumFields(this.l5Fields().map(({ amount }) => amount))

  /**
   * Total dividends on all schedule Bs.
   */
  to1040l3b = (): number =>
    [this, ...this.copies()].reduce((acc, f) => acc + f.l6(), 0)

  foreignAccount = (): boolean =>
    this.f1040.info.questions.FOREIGN_ACCOUNT_EXISTS ?? false
  fincenForm = (): boolean => this.f1040.info.questions.FINCEN_114 ?? false
  fincenCountry = (): string | undefined =>
    this.f1040.info.questions.FINCEN_114_ACCOUNT_COUNTRY
  foreignTrust = (): boolean =>
    this.f1040.info.questions.FOREIGN_TRUST_RELATIONSHIP ?? false

  l7a = (): [boolean, boolean] => [
    this.foreignAccount(),
    !this.foreignAccount()
  ]

  l7a2 = (): [boolean, boolean] => [this.fincenForm(), !this.fincenForm()]

  l7b = (): string | undefined => this.fincenCountry()

  l8 = (): [boolean, boolean] => [this.foreignTrust(), !this.foreignTrust()]

  fields = (): Field[] => [
    this.f1040.namesString(),
    this.f1040.info.taxPayer.primaryPerson.ssid,
    ...this.l1(),
    this.l2(),
    this.l3(),
    this.l4(),
    ...this.l5(),
    this.l6(),
    ...this.l7a(),
    ...this.l7a2(),
    this.l7b(),
    undefined, // there are two separate fields for line 7b.
    ...this.l8()
  ]

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // Spreads manually expanded: l1() → 28 fields, l5() → 30 fields, l7a/l7a2/l8 → 2 each
  fillInstructions = (): FillInstructions => {
    const l1 = this.l1() // 14 interest payers × 2 = 28
    const l5 = this.l5() // 15 dividend payers × 2 = 30
    const l7a = this.l7a()
    const l7a2 = this.l7a2()
    const l8 = this.l8()
    return [
      text('topmostSubform[0].Page1[0].f1_01[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page1[0].f1_02[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      // l1() — interest payer rows
      text('topmostSubform[0].Page1[0].Line1_ReadOrder[0].f1_03[0]', l1[0]),
      text('topmostSubform[0].Page1[0].f1_04[0]', l1[1]),
      text('topmostSubform[0].Page1[0].f1_05[0]', l1[2]),
      text('topmostSubform[0].Page1[0].f1_06[0]', l1[3]),
      text('topmostSubform[0].Page1[0].f1_07[0]', l1[4]),
      text('topmostSubform[0].Page1[0].f1_08[0]', l1[5]),
      text('topmostSubform[0].Page1[0].f1_09[0]', l1[6]),
      text('topmostSubform[0].Page1[0].f1_10[0]', l1[7]),
      text('topmostSubform[0].Page1[0].f1_11[0]', l1[8]),
      text('topmostSubform[0].Page1[0].f1_12[0]', l1[9]),
      text('topmostSubform[0].Page1[0].f1_13[0]', l1[10]),
      text('topmostSubform[0].Page1[0].f1_14[0]', l1[11]),
      text('topmostSubform[0].Page1[0].f1_15[0]', l1[12]),
      text('topmostSubform[0].Page1[0].f1_16[0]', l1[13]),
      text('topmostSubform[0].Page1[0].f1_17[0]', l1[14]),
      text('topmostSubform[0].Page1[0].f1_18[0]', l1[15]),
      text('topmostSubform[0].Page1[0].f1_19[0]', l1[16]),
      text('topmostSubform[0].Page1[0].f1_20[0]', l1[17]),
      text('topmostSubform[0].Page1[0].f1_21[0]', l1[18]),
      text('topmostSubform[0].Page1[0].f1_22[0]', l1[19]),
      text('topmostSubform[0].Page1[0].f1_23[0]', l1[20]),
      text('topmostSubform[0].Page1[0].f1_24[0]', l1[21]),
      text('topmostSubform[0].Page1[0].f1_25[0]', l1[22]),
      text('topmostSubform[0].Page1[0].f1_26[0]', l1[23]),
      text('topmostSubform[0].Page1[0].f1_27[0]', l1[24]),
      text('topmostSubform[0].Page1[0].f1_28[0]', l1[25]),
      text('topmostSubform[0].Page1[0].f1_29[0]', l1[26]),
      text('topmostSubform[0].Page1[0].f1_30[0]', l1[27]),
      // Lines 2–4
      text('topmostSubform[0].Page1[0].f1_31[0]', this.l2()),
      text('topmostSubform[0].Page1[0].f1_32[0]', this.l3()),
      text('topmostSubform[0].Page1[0].f1_33[0]', this.l4()),
      // l5() — dividend payer rows
      text('topmostSubform[0].Page1[0].ReadOrderControl[0].f1_34[0]', l5[0]),
      text('topmostSubform[0].Page1[0].f1_35[0]', l5[1]),
      text('topmostSubform[0].Page1[0].f1_36[0]', l5[2]),
      text('topmostSubform[0].Page1[0].f1_37[0]', l5[3]),
      text('topmostSubform[0].Page1[0].f1_38[0]', l5[4]),
      text('topmostSubform[0].Page1[0].f1_39[0]', l5[5]),
      text('topmostSubform[0].Page1[0].f1_40[0]', l5[6]),
      text('topmostSubform[0].Page1[0].f1_41[0]', l5[7]),
      text('topmostSubform[0].Page1[0].f1_42[0]', l5[8]),
      text('topmostSubform[0].Page1[0].f1_43[0]', l5[9]),
      text('topmostSubform[0].Page1[0].f1_44[0]', l5[10]),
      text('topmostSubform[0].Page1[0].f1_45[0]', l5[11]),
      text('topmostSubform[0].Page1[0].f1_46[0]', l5[12]),
      text('topmostSubform[0].Page1[0].f1_47[0]', l5[13]),
      text('topmostSubform[0].Page1[0].f1_48[0]', l5[14]),
      text('topmostSubform[0].Page1[0].f1_49[0]', l5[15]),
      text('topmostSubform[0].Page1[0].f1_50[0]', l5[16]),
      text('topmostSubform[0].Page1[0].f1_51[0]', l5[17]),
      text('topmostSubform[0].Page1[0].f1_52[0]', l5[18]),
      text('topmostSubform[0].Page1[0].f1_53[0]', l5[19]),
      text('topmostSubform[0].Page1[0].f1_54[0]', l5[20]),
      text('topmostSubform[0].Page1[0].f1_55[0]', l5[21]),
      text('topmostSubform[0].Page1[0].f1_56[0]', l5[22]),
      text('topmostSubform[0].Page1[0].f1_57[0]', l5[23]),
      text('topmostSubform[0].Page1[0].f1_58[0]', l5[24]),
      text('topmostSubform[0].Page1[0].f1_59[0]', l5[25]),
      text('topmostSubform[0].Page1[0].f1_60[0]', l5[26]),
      text('topmostSubform[0].Page1[0].f1_61[0]', l5[27]),
      text('topmostSubform[0].Page1[0].f1_62[0]', l5[28]),
      text('topmostSubform[0].Page1[0].f1_63[0]', l5[29]),
      // Line 6
      text('topmostSubform[0].Page1[0].f1_64[0]', this.l6()),
      // Line 7a — foreign account Yes / No checkboxes
      checkbox(
        'topmostSubform[0].Page1[0].TagcorrectingSubform[0].c1_1[0]',
        l7a[0]
      ),
      checkbox(
        'topmostSubform[0].Page1[0].TagcorrectingSubform[0].c1_1[1]',
        l7a[1]
      ),
      // Line 7a (FINCEN) — Yes / No checkboxes
      checkbox('topmostSubform[0].Page1[0].c1_2[0]', l7a2[0]),
      checkbox('topmostSubform[0].Page1[0].c1_2[1]', l7a2[1]),
      // Line 7b — FINCEN country
      text('topmostSubform[0].Page1[0].f1_65[0]', this.l7b()),
      text('topmostSubform[0].Page1[0].f1_66[0]', undefined),
      // Line 8 — foreign trust Yes / No checkboxes
      checkbox('topmostSubform[0].Page1[0].c1_3[0]', l8[0]),
      checkbox('topmostSubform[0].Page1[0].c1_3[1]', l8[1])
    ]
  }
}
