import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { Address, Business } from 'ustaxes/core/data'

// Schedule C field names drift across years; map by field name to keep PDF fill stable.
const FIELD_ORDER: string[] = [
  'topmostSubform[0].Page1[0].f1_1[0]',
  'topmostSubform[0].Page1[0].f1_2[0]',
  'topmostSubform[0].Page1[0].f1_3[0]',
  'topmostSubform[0].Page1[0].BComb[0].f1_4[0]',
  'topmostSubform[0].Page1[0].f1_5[0]',
  'topmostSubform[0].Page1[0].DComb[0].f1_6[0]',
  'topmostSubform[0].Page1[0].f1_7[0]',
  'topmostSubform[0].Page1[0].f1_8[0]',
  'topmostSubform[0].Page1[0].c1_1[0]',
  'topmostSubform[0].Page1[0].c1_1[1]',
  'topmostSubform[0].Page1[0].c1_1[2]',
  'topmostSubform[0].Page1[0].f1_9[0]',
  'topmostSubform[0].Page1[0].c1_2[0]',
  'topmostSubform[0].Page1[0].c1_2[1]',
  'topmostSubform[0].Page1[0].c1_3[0]',
  'topmostSubform[0].Page1[0].c1_4[0]',
  'topmostSubform[0].Page1[0].c1_4[1]',
  'topmostSubform[0].Page1[0].c1_5[0]',
  'topmostSubform[0].Page1[0].c1_5[1]',
  'topmostSubform[0].Page1[0].c1_6[0]',
  'topmostSubform[0].Page1[0].f1_10[0]',
  'topmostSubform[0].Page1[0].f1_11[0]',
  'topmostSubform[0].Page1[0].f1_12[0]',
  'topmostSubform[0].Page1[0].f1_13[0]',
  'topmostSubform[0].Page1[0].f1_14[0]',
  'topmostSubform[0].Page1[0].f1_15[0]',
  'topmostSubform[0].Page1[0].f1_16[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_17[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_18[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_19[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_20[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_21[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_22[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_23[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_24[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_25[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_26[0]',
  'topmostSubform[0].Page1[0].Lines8-17[0].f1_27[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_28[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_29[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_30[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_31[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_32[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_33[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_34[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_35[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_36[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_37[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_38[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_39[0]',
  'topmostSubform[0].Page1[0].Lines18-27[0].f1_40[0]',
  'topmostSubform[0].Page1[0].f1_41[0]',
  'topmostSubform[0].Page1[0].f1_42[0]',
  'topmostSubform[0].Page1[0].Line30_ReadOrder[0].f1_43[0]',
  'topmostSubform[0].Page1[0].Line30_ReadOrder[0].f1_44[0]',
  'topmostSubform[0].Page1[0].f1_45[0]',
  'topmostSubform[0].Page1[0].f1_46[0]',
  'topmostSubform[0].Page1[0].c1_7[0]',
  'topmostSubform[0].Page1[0].c1_7[1]',
  'topmostSubform[0].Page2[0].c2_1[0]',
  'topmostSubform[0].Page2[0].c2_2[0]',
  'topmostSubform[0].Page2[0].c2_3[0]',
  'topmostSubform[0].Page2[0].c2_4[0]',
  'topmostSubform[0].Page2[0].c2_4[1]',
  'topmostSubform[0].Page2[0].f2_1[0]',
  'topmostSubform[0].Page2[0].f2_2[0]',
  'topmostSubform[0].Page2[0].f2_3[0]',
  'topmostSubform[0].Page2[0].f2_4[0]',
  'topmostSubform[0].Page2[0].f2_5[0]',
  'topmostSubform[0].Page2[0].f2_6[0]',
  'topmostSubform[0].Page2[0].f2_7[0]',
  'topmostSubform[0].Page2[0].f2_8[0]',
  'topmostSubform[0].Page2[0].f2_9[0]',
  'topmostSubform[0].Page2[0].f2_10[0]',
  'topmostSubform[0].Page2[0].f2_11[0]',
  'topmostSubform[0].Page2[0].f2_12[0]',
  'topmostSubform[0].Page2[0].f2_13[0]',
  'topmostSubform[0].Page2[0].f2_14[0]',
  'topmostSubform[0].Page2[0].c2_5[0]',
  'topmostSubform[0].Page2[0].c2_5[1]',
  'topmostSubform[0].Page2[0].c2_6[0]',
  'topmostSubform[0].Page2[0].c2_6[1]',
  'topmostSubform[0].Page2[0].c2_7[0]',
  'topmostSubform[0].Page2[0].c2_7[1]',
  'topmostSubform[0].Page2[0].c2_8[0]',
  'topmostSubform[0].Page2[0].c2_8[1]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item1[0].f2_15[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item1[0].f2_16[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item2[0].f2_17[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item2[0].f2_18[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item3[0].f2_19[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item3[0].f2_20[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item4[0].f2_21[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item4[0].f2_22[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item5[0].f2_23[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item5[0].f2_24[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item6[0].f2_25[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item6[0].f2_26[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item7[0].f2_27[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item7[0].f2_28[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item8[0].f2_29[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item8[0].f2_30[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item9[0].f2_31[0]',
  'topmostSubform[0].Page2[0].PartVTable[0].Item9[0].f2_32[0]',
  'topmostSubform[0].Page2[0].f2_33[0]'
]

export default class ScheduleC extends F1040Attachment {
  tag: FormTag = 'f1040sc'
  sequenceIndex = 9

  businesses = (): Business[] => this.f1040.info.businesses ?? []

  isNeeded = (): boolean => this.businesses().length > 0

  sumBusinesses = (f: (b: Business) => number | undefined): number =>
    sumFields(this.businesses().map((b) => f(b)))

  totalExpenses = (b: Business): number => {
    const values = Object.values(b.expenses ?? {}) as Array<number | undefined>
    return sumFields(values)
  }

  l1 = (): number | undefined =>
    this.sumBusinesses((b) => b.income.grossReceipts)

  l2 = (): number | undefined =>
    this.sumBusinesses((b) => b.income.returnsAndAllowances)

  l6 = (): number | undefined =>
    this.sumBusinesses((b) => b.income.otherIncome ?? 0)

  l7 = (): number => sumFields([this.l1(), this.l6()]) - (this.l2() ?? 0)

  l28 = (): number => this.sumBusinesses((b) => this.totalExpenses(b))

  l29 = (): number => this.l7() - this.l28()

  l30 = (): number | undefined =>
    this.sumBusinesses((b) => b.homeOfficeDeduction ?? 0)

  l31 = (): number => this.l29() - (this.l30() ?? 0)

  formatAddress = (address: Address | undefined): string | undefined => {
    if (!address) {
      return undefined
    }
    const parts = [
      address.address,
      address.city,
      address.state ?? address.province ?? '',
      address.zip ?? address.postalCode ?? ''
    ].filter((p) => p && p.toString().trim().length > 0)
    return parts.join(', ')
  }

  fields = (): Field[] => {
    const business = this.businesses()[0]
    const values: Record<string, Field> = {
      'topmostSubform[0].Page1[0].f1_1[0]': this.f1040.namesString(),
      'topmostSubform[0].Page1[0].f1_2[0]':
        this.f1040.info.taxPayer.primaryPerson.ssid,
      'topmostSubform[0].Page1[0].f1_3[0]': business.name,
      'topmostSubform[0].Page1[0].BComb[0].f1_4[0]': business.businessCode,
      'topmostSubform[0].Page1[0].f1_5[0]': this.formatAddress(
        business.address
      ),
      'topmostSubform[0].Page1[0].f1_10[0]': business.income.grossReceipts,
      'topmostSubform[0].Page1[0].f1_41[0]': this.l31()
    }

    return FIELD_ORDER.map((name) => values[name])
  }
}
