import {
  Address,
  Property,
  PropertyType,
  PropertyExpenseTypeName
} from 'ustaxes/core/data'
import { displayNegPos, sumFields } from 'ustaxes/core/irsForms/util'
import _ from 'lodash'
import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'

type Cell = number | undefined
export type MatrixRow = [Cell, Cell, Cell]

const fill = (values: number[]): MatrixRow => {
  const realValues = (values as Cell[]).slice(0, 3).map((v) => {
    if (v === 0) {
      return undefined
    }
    return v
  })
  return [
    ...realValues,
    ...Array.from(Array(3 - realValues.length)).map(() => undefined)
  ] as MatrixRow
}

const propTypeIndex = {
  [PropertyType.singleFamily]: 1,
  [PropertyType.multiFamily]: 2,
  [PropertyType.vacation]: 3,
  [PropertyType.commercial]: 4,
  [PropertyType.land]: 5,
  [PropertyType.selfRental]: 7,
  [PropertyType.other]: 8
}

export default class ScheduleE extends F1040Attachment {
  tag: FormTag = 'f1040se'
  sequenceIndex = 13

  isNeeded = (): boolean =>
    this.f1040.info.realEstate.length > 0 ||
    this.f1040.info.scheduleK1Form1065s.length > 0

  addressString = (address: Address): string =>
    [
      address.address,
      address.city,
      address.state ?? address.province ?? '',
      address.zip ?? address.postalCode ?? ''
    ].join(', ')

  propForRow = (row: number): Property | undefined => {
    if (row < this.f1040.info.realEstate.length) {
      return this.f1040.info.realEstate[row]
    }
  }

  /**
   * Whether or not you can deduct expenses for the unit depends on whether or not you used
   * the unit as a home in 2023. You used the unit as a home if your personal use of the unit
   * was more than the greater of:
   * 14 days, or
   * 10% of the total days it was rented to others at a fair rental price.
   * @param p
   */
  propertyUseTest = (p: Property): boolean =>
    p.personalUseDays <= Math.max(14, 0.1 * p.rentalDays)

  l3 = (): MatrixRow => {
    const properties = this.f1040.info.realEstate
    return fill(properties.map((a) => a.rentReceived))
  }

  // TODO: not implemented
  l4 = (): MatrixRow => {
    return [undefined, undefined, undefined]
  }

  getExpensesRow = (expType: PropertyExpenseTypeName): MatrixRow =>
    fill(
      this.f1040.info.realEstate.map((p) => {
        if (this.propertyUseTest(p)) {
          return p.expenses[expType] ?? 0
        }
        return 0
      })
    )

  // Matching order of expenses in rows of form
  expenses: PropertyExpenseTypeName[] = [
    'advertising',
    'auto',
    'cleaning',
    'commissions',
    'insurance',
    'legal',
    'management',
    'mortgage',
    'otherInterest',
    'repairs',
    'supplies',
    'taxes',
    'utilities',
    'depreciation'
  ]

  l19 = (): [string | undefined, MatrixRow] => {
    const expenseRow = this.getExpensesRow('other')
    const otherText = this.f1040.info.realEstate
      .flatMap((p) =>
        p.otherExpenseType !== undefined ? [p.otherExpenseType] : []
      )
      .join(',')
    return [otherText, expenseRow]
  }

  allExpenses = (): MatrixRow[] =>
    this.expenses.map((e) => this.getExpensesRow(e))

  l12 = (): MatrixRow => this.getExpensesRow('mortgage')
  l18 = (): MatrixRow => this.getExpensesRow('depreciation')

  // TODO - required from pub 596 worksheet 1
  royaltyExpenses = (): number | undefined => undefined

  l20 = (): MatrixRow =>
    fill(_.unzip(this.allExpenses()).map((column) => sumFields(column)))

  l21 = (): MatrixRow =>
    _.zipWith(
      this.l3(),
      this.l4(),
      this.l20(),
      (x, y, z) => (x ?? 0) + (y ?? 0) - (z ?? 0)
    ) as MatrixRow

  // Deductible real estate loss from 8582, as positive number
  l22 = (): MatrixRow =>
    this.f1040.f8582?.deductibleRealEstateLossAfterLimitation() ?? [
      undefined,
      undefined,
      undefined
    ]

  l23a = (): number => sumFields(this.l3())
  l23b = (): number => sumFields(this.l4())
  l23c = (): number => sumFields(this.l12())
  l23d = (): number => sumFields(this.l18())
  l23e = (): number => sumFields(this.l20())

  rentalNet = (): MatrixRow =>
    _.zipWith(this.l3(), this.l20(), (x, y) => (x ?? 0) - (y ?? 0)) as MatrixRow

  l24 = (): number =>
    sumFields(this.l21().filter((x) => x !== undefined && x > 0))

  // TODO: Royalty losses
  l25 = (): number => sumFields(this.l22())

  l26 = (): number => sumFields([this.l24(), this.l25()])

  // TODO: required from Pub 596
  l29ah = (): number | undefined =>
    this.f1040.info.scheduleK1Form1065s.reduce(
      (t, k1) => t + Math.max(0, k1.isPassive ? k1.ordinaryBusinessIncome : 0),
      0
    )
  l29ak = (): number | undefined =>
    this.f1040.info.scheduleK1Form1065s.reduce(
      (t, k1) => t + Math.max(0, k1.isPassive ? 0 : k1.ordinaryBusinessIncome),
      0
    )

  l29bg = (): number | undefined =>
    this.f1040.info.scheduleK1Form1065s.reduce(
      (t, k1) => t + Math.min(0, k1.isPassive ? k1.ordinaryBusinessIncome : 0),
      0
    )
  l29bi = (): number | undefined =>
    this.f1040.info.scheduleK1Form1065s.reduce(
      (t, k1) => t + Math.min(0, k1.isPassive ? 0 : k1.ordinaryBusinessIncome),
      0
    )
  l29bj = (): number | undefined => undefined

  l30 = (): number | undefined => sumFields([this.l29ah(), this.l29ak()])
  l31 = (): number | undefined =>
    sumFields([this.l29bg(), this.l29bi(), this.l29bj()])
  l32 = (): number | undefined => sumFields([this.l30(), this.l31()])

  l34ad = (): number | undefined => undefined
  l34af = (): number | undefined => undefined
  l34bc = (): number | undefined => undefined
  l34be = (): number | undefined => undefined

  // TODO: Real estate trust income or loss
  l37 = (): number | undefined => undefined

  // TODO: REMICS income or loss
  l39 = (): number | undefined => undefined

  // TODO: Farm rental income or loss
  l40 = (): number | undefined => undefined

  l41 = (): number =>
    sumFields([this.l26(), this.l32(), this.l37(), this.l39(), this.l40()])

  fields = (): Field[] => {
    const [p0, p1, p2] = [0, 1, 2].map((i) => this.propForRow(i))

    // TODO: Support more than 4 K1s
    const k1s = this.f1040.info.scheduleK1Form1065s
    const l28Fields: Field[] = []
    l28Fields.push(
      ...k1s
        .slice(0, 4)
        .flatMap((k1) => [
          k1.partnershipName,
          k1.partnerOrSCorp,
          k1.isForeign,
          k1.partnershipEin,
          false,
          false
        ])
    )
    l28Fields.push(
      ...Array<undefined>(6 * Math.max(0, 4 - k1s.length)).fill(undefined)
    )
    l28Fields.push(
      ...k1s.slice(0, 4).flatMap((k1) => {
        if (k1.isPassive) {
          if (k1.ordinaryBusinessIncome < 0) {
            return [k1.ordinaryBusinessIncome, 0, 0, 0, 0]
          } else {
            return [0, k1.ordinaryBusinessIncome, 0, 0, 0]
          }
        } else {
          if (k1.ordinaryBusinessIncome < 0) {
            return [0, 0, k1.ordinaryBusinessIncome, 0, 0]
          } else {
            return [0, 0, 0, 0, k1.ordinaryBusinessIncome]
          }
        }
      })
    )
    l28Fields.push(
      ...Array<undefined>(5 * Math.max(0, 4 - k1s.length)).fill(undefined)
    )

    return [
      this.f1040.namesString(),
      this.f1040.info.taxPayer.primaryPerson.ssid,
      false,
      false,
      false,
      false,
      ...[p0, p1, p2].map((p) =>
        p === undefined ? undefined : this.addressString(p.address)
      ),
      p0 === undefined
        ? undefined
        : propTypeIndex[PropertyType[p0.propertyType]],
      p1 === undefined
        ? undefined
        : propTypeIndex[PropertyType[p1.propertyType]],
      p2 === undefined
        ? undefined
        : propTypeIndex[PropertyType[p2.propertyType]],
      p0?.rentalDays,
      p0?.personalUseDays,
      p0?.qualifiedJointVenture,
      p1?.rentalDays,
      p1?.personalUseDays,
      p1?.qualifiedJointVenture,
      p2?.rentalDays,
      p2?.personalUseDays,
      p2?.qualifiedJointVenture,
      [p0, p1, p2].find((p) => p?.propertyType === 'other')
        ?.otherPropertyType ?? undefined,
      ...this.l3(),
      ...this.l4(),
      ...this.allExpenses().flat(),
      ...this.l19().flat(),
      ...this.l20(),
      ...this.l21(),
      ...this.l22(),
      this.l23a(),
      this.l23b(),
      this.l23c(),
      this.l23d(),
      this.l23e(),
      this.l24(),
      Math.abs(this.l25()),
      displayNegPos(this.l26()),
      // Page 2 - TODO: Only part II implemented
      this.f1040.namesString(),
      this.f1040.info.taxPayer.primaryPerson.ssid,
      ...[false, false], // l27
      ...l28Fields,
      undefined, // grey
      this.l29ah(),
      undefined, // grey
      undefined, // grey
      this.l29ak(),
      this.l29bg(),
      undefined, // grey
      this.l29bi(),
      this.l29bj(),
      undefined, // grey
      this.l30(),
      this.l31(),
      this.l32(), // l32
      ...Array<undefined>(2 * 6).fill(undefined), // l33
      undefined,
      this.l34ad(),
      undefined,
      this.l34af(),
      this.l34bc(),
      undefined, // grey
      this.l34be(),
      undefined, // grey
      undefined, // l35
      undefined, // l36
      this.l37(), // l37
      ...Array<undefined>(5).fill(undefined), // l38
      this.l39(), // l39
      this.l40(), // l40
      this.l41(), // l41
      undefined,
      undefined
    ]
  }

  fillInstructions = (): FillInstructions => {
    const [p0, p1, p2] = [0, 1, 2].map((i) => this.propForRow(i))
    const k1s = this.f1040.info.scheduleK1Form1065s

    type K1InfoRow = [
      string | undefined,
      string | undefined,
      boolean | undefined,
      string | undefined,
      boolean | undefined,
      boolean | undefined
    ]
    const k1InfoRow = (idx: number): K1InfoRow => {
      const k1 = k1s.at(idx)
      if (k1 === undefined)
        return [
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined
        ]
      return [
        k1.partnershipName,
        k1.partnerOrSCorp,
        k1.isForeign,
        k1.partnershipEin,
        false,
        false
      ]
    }

    type K1IncomeRow = [
      number | undefined,
      number | undefined,
      number | undefined,
      number | undefined,
      number | undefined
    ]
    const k1IncomeRow = (idx: number): K1IncomeRow => {
      const k1 = k1s.at(idx)
      if (k1 === undefined)
        return [undefined, undefined, undefined, undefined, undefined]
      if (k1.isPassive) {
        if (k1.ordinaryBusinessIncome < 0)
          return [k1.ordinaryBusinessIncome, 0, 0, 0, 0]
        return [0, k1.ordinaryBusinessIncome, 0, 0, 0]
      } else {
        if (k1.ordinaryBusinessIncome < 0)
          return [0, 0, k1.ordinaryBusinessIncome, 0, 0]
        return [0, 0, 0, 0, k1.ordinaryBusinessIncome]
      }
    }

    const [l19text, l19vals] = this.l19()
    const allExp = this.allExpenses()
    const l3 = this.l3()
    const l4 = this.l4()
    const l20 = this.l20()
    const l21 = this.l21()
    const l22 = this.l22()

    const [k1a, k1b, k1c, k1d] = [0, 1, 2, 3].map(k1InfoRow)
    const [ki0, ki1, ki2, ki3] = [0, 1, 2, 3].map(k1IncomeRow)

    return [
      // Page 1 header
      text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page1[0].f1_2[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      checkbox('topmostSubform[0].Page1[0].c1_1[0]', false),
      checkbox('topmostSubform[0].Page1[0].c1_1[1]', false),
      checkbox('topmostSubform[0].Page1[0].c1_2[0]', false),
      checkbox('topmostSubform[0].Page1[0].c1_2[1]', false),
      // Line 1a - property addresses
      text(
        'topmostSubform[0].Page1[0].Table_Line1a[0].RowA[0].f1_3[0]',
        p0 === undefined ? undefined : this.addressString(p0.address)
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line1a[0].RowB[0].f1_4[0]',
        p1 === undefined ? undefined : this.addressString(p1.address)
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line1a[0].RowC[0].f1_5[0]',
        p2 === undefined ? undefined : this.addressString(p2.address)
      ),
      // Line 1b - property type numbers
      text(
        'topmostSubform[0].Page1[0].Table_Line1b[0].RowA[0].f1_6[0]',
        p0 === undefined
          ? undefined
          : propTypeIndex[PropertyType[p0.propertyType]]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line1b[0].RowB[0].f1_7[0]',
        p1 === undefined
          ? undefined
          : propTypeIndex[PropertyType[p1.propertyType]]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line1b[0].RowC[0].f1_8[0]',
        p2 === undefined
          ? undefined
          : propTypeIndex[PropertyType[p2.propertyType]]
      ),
      // Line 2 - fair rental / personal use days + QJV checkbox
      text(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowA[0].f1_9[0]',
        p0?.rentalDays
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowA[0].f1_10[0]',
        p0?.personalUseDays
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowA[0].c1_3[0]',
        p0?.qualifiedJointVenture
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowB[0].f1_11[0]',
        p1?.rentalDays
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowB[0].f1_12[0]',
        p1?.personalUseDays
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowB[0].c1_4[0]',
        p1?.qualifiedJointVenture
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowC[0].f1_13[0]',
        p2?.rentalDays
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowC[0].f1_14[0]',
        p2?.personalUseDays
      ),
      checkbox(
        'topmostSubform[0].Page1[0].Table_Line2[0].RowC[0].c1_5[0]',
        p2?.qualifiedJointVenture
      ),
      // Other property type description
      text(
        'topmostSubform[0].Page1[0].f1_15[0]',
        [p0, p1, p2].find((p) => p?.propertyType === 'other')
          ?.otherPropertyType ?? undefined
      ),
      // Line 3 - rents received
      text(
        'topmostSubform[0].Page1[0].Table_Income[0].Line3[0].f1_16[0]',
        l3[0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Income[0].Line3[0].f1_17[0]',
        l3[1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Income[0].Line3[0].f1_18[0]',
        l3[2]
      ),
      // Line 4 - royalties
      text(
        'topmostSubform[0].Page1[0].Table_Income[0].Line4[0].f1_19[0]',
        l4[0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Income[0].Line4[0].f1_20[0]',
        l4[1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Income[0].Line4[0].f1_21[0]',
        l4[2]
      ),
      // Line 5 - advertising
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line5[0].f1_22[0]',
        allExp[0][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line5[0].f1_23[0]',
        allExp[0][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line5[0].f1_24[0]',
        allExp[0][2]
      ),
      // Line 6 - auto and travel
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line6[0].f1_25[0]',
        allExp[1][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line6[0].f1_26[0]',
        allExp[1][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line6[0].f1_27[0]',
        allExp[1][2]
      ),
      // Line 7 - cleaning and maintenance
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line7[0].f1_28[0]',
        allExp[2][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line7[0].f1_29[0]',
        allExp[2][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line7[0].f1_30[0]',
        allExp[2][2]
      ),
      // Line 8 - commissions
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line8[0].f1_31[0]',
        allExp[3][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line8[0].f1_32[0]',
        allExp[3][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line8[0].f1_33[0]',
        allExp[3][2]
      ),
      // Line 9 - insurance
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line9[0].f1_34[0]',
        allExp[4][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line9[0].f1_35[0]',
        allExp[4][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line9[0].f1_36[0]',
        allExp[4][2]
      ),
      // Line 10 - legal and professional
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line10[0].f1_37[0]',
        allExp[5][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line10[0].f1_38[0]',
        allExp[5][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line10[0].f1_39[0]',
        allExp[5][2]
      ),
      // Line 11 - management fees
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line11[0].f1_40[0]',
        allExp[6][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line11[0].f1_41[0]',
        allExp[6][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line11[0].f1_42[0]',
        allExp[6][2]
      ),
      // Line 12 - mortgage interest
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line12[0].f1_43[0]',
        allExp[7][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line12[0].f1_44[0]',
        allExp[7][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line12[0].f1_45[0]',
        allExp[7][2]
      ),
      // Line 13 - other interest
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line13[0].f1_46[0]',
        allExp[8][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line13[0].f1_47[0]',
        allExp[8][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line13[0].f1_48[0]',
        allExp[8][2]
      ),
      // Line 14 - repairs
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line14[0].f1_49[0]',
        allExp[9][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line14[0].f1_50[0]',
        allExp[9][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line14[0].f1_51[0]',
        allExp[9][2]
      ),
      // Line 15 - supplies
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line15[0].f1_52[0]',
        allExp[10][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line15[0].f1_53[0]',
        allExp[10][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line15[0].f1_54[0]',
        allExp[10][2]
      ),
      // Line 16 - taxes
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line16[0].f1_55[0]',
        allExp[11][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line16[0].f1_56[0]',
        allExp[11][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line16[0].f1_57[0]',
        allExp[11][2]
      ),
      // Line 17 - utilities
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line17[0].f1_58[0]',
        allExp[12][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line17[0].f1_59[0]',
        allExp[12][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line17[0].f1_60[0]',
        allExp[12][2]
      ),
      // Line 18 - depreciation
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line18[0].f1_61[0]',
        allExp[13][0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line18[0].f1_62[0]',
        allExp[13][1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line18[0].f1_63[0]',
        allExp[13][2]
      ),
      // Line 19 - other expenses (label + 3 amount columns)
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line19[0].f1_64[0]',
        l19text
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line19[0].f1_65[0]',
        l19vals[0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line19[0].f1_66[0]',
        l19vals[1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line19[0].f1_67[0]',
        l19vals[2]
      ),
      // Line 20 - total expenses
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line20[0].f1_68[0]',
        l20[0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line20[0].f1_69[0]',
        l20[1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line20[0].f1_70[0]',
        l20[2]
      ),
      // Line 21 - income or loss
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line21[0].f1_71[0]',
        l21[0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line21[0].f1_72[0]',
        l21[1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line21[0].f1_73[0]',
        l21[2]
      ),
      // Line 22 - deductible rental real estate loss
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line22[0].f1_74[0]',
        l22[0]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line22[0].f1_75[0]',
        l22[1]
      ),
      text(
        'topmostSubform[0].Page1[0].Table_Expenses[0].Line22[0].f1_76[0]',
        l22[2]
      ),
      // Lines 23-26 summary totals
      text('topmostSubform[0].Page1[0].f1_77[0]', this.l23a()),
      text('topmostSubform[0].Page1[0].f1_78[0]', this.l23b()),
      text('topmostSubform[0].Page1[0].f1_79[0]', this.l23c()),
      text('topmostSubform[0].Page1[0].f1_80[0]', this.l23d()),
      text('topmostSubform[0].Page1[0].f1_81[0]', this.l23e()),
      text('topmostSubform[0].Page1[0].f1_82[0]', this.l24()),
      text('topmostSubform[0].Page1[0].f1_83[0]', Math.abs(this.l25())),
      text('topmostSubform[0].Page1[0].f1_84[0]', displayNegPos(this.l26())),
      // Page 2 header
      text('topmostSubform[0].Page2[0].f2_1[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page2[0].f2_2[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      checkbox('topmostSubform[0].Page2[0].c2_1[0]', false),
      checkbox('topmostSubform[0].Page2[0].c2_1[1]', false),
      // Line 28a-f: K-1 partnership info (up to 4 rows)
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowA[0].f2_3[0]',
        k1a[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowA[0].f2_4[0]',
        k1a[1]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowA[0].c2_2[0]',
        k1a[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowA[0].f2_5[0]',
        k1a[3]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowA[0].c2_3[0]',
        k1a[4]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowA[0].c2_4[0]',
        k1a[5]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowB[0].f2_6[0]',
        k1b[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowB[0].f2_7[0]',
        k1b[1]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowB[0].c2_5[0]',
        k1b[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowB[0].f2_8[0]',
        k1b[3]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowB[0].c2_6[0]',
        k1b[4]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowB[0].c2_7[0]',
        k1b[5]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowC[0].f2_9[0]',
        k1c[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowC[0].f2_10[0]',
        k1c[1]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowC[0].c2_8[0]',
        k1c[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowC[0].f2_11[0]',
        k1c[3]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowC[0].c2_9[0]',
        k1c[4]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowC[0].c2_10[0]',
        k1c[5]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowD[0].f2_12[0]',
        k1d[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowD[0].f2_13[0]',
        k1d[1]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowD[0].c2_11[0]',
        k1d[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowD[0].f2_14[0]',
        k1d[3]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowD[0].c2_12[0]',
        k1d[4]
      ),
      checkbox(
        'topmostSubform[0].Page2[0].Table_Line28a-f[0].RowD[0].c2_13[0]',
        k1d[5]
      ),
      // Line 28g-k: K-1 income columns (up to 4 rows × 5 cols)
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowA[0].f2_15[0]',
        ki0[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowA[0].f2_16[0]',
        ki0[1]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowA[0].f2_17[0]',
        ki0[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowA[0].f2_18[0]',
        ki0[3]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowA[0].f2_19[0]',
        ki0[4]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowB[0].f2_20[0]',
        ki1[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowB[0].f2_21[0]',
        ki1[1]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowB[0].f2_22[0]',
        ki1[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowB[0].f2_23[0]',
        ki1[3]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowB[0].f2_24[0]',
        ki1[4]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowC[0].f2_25[0]',
        ki2[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowC[0].f2_26[0]',
        ki2[1]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowC[0].f2_27[0]',
        ki2[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowC[0].f2_28[0]',
        ki2[3]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowC[0].f2_29[0]',
        ki2[4]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowD[0].f2_30[0]',
        ki3[0]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowD[0].f2_31[0]',
        ki3[1]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowD[0].f2_32[0]',
        ki3[2]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowD[0].f2_33[0]',
        ki3[3]
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line28g-k[0].RowD[0].f2_34[0]',
        ki3[4]
      ),
      // Line 29 - passive/nonpassive income totals
      text('topmostSubform[0].Page2[0].f2_35[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_36[0]', this.l29ah()),
      text('topmostSubform[0].Page2[0].f2_37[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_38[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_39[0]', this.l29ak()),
      text('topmostSubform[0].Page2[0].f2_40[0]', this.l29bg()),
      text('topmostSubform[0].Page2[0].f2_41[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_42[0]', this.l29bi()),
      text('topmostSubform[0].Page2[0].f2_43[0]', this.l29bj()),
      text('topmostSubform[0].Page2[0].f2_44[0]', undefined),
      // Lines 30-32
      text('topmostSubform[0].Page2[0].f2_45[0]', this.l30()),
      text('topmostSubform[0].Page2[0].f2_46[0]', this.l31()),
      text('topmostSubform[0].Page2[0].f2_47[0]', this.l32()),
      // Line 33 - S-corp totals (not implemented)
      text(
        'topmostSubform[0].Page2[0].Table_Line33a-b[0].RowA[0].f2_48[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33a-b[0].RowA[0].f2_49[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33a-b[0].RowB[0].f2_50[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33a-b[0].RowB[0].f2_51[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowA[0].f2_52[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowA[0].f2_53[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowA[0].f2_54[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowA[0].f2_55[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowB[0].f2_56[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowB[0].f2_57[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowB[0].f2_58[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line33c-f[0].RowB[0].f2_59[0]',
        undefined
      ),
      // Line 34 - estates and trusts (not implemented)
      text('topmostSubform[0].Page2[0].f2_60[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_61[0]', this.l34ad()),
      text('topmostSubform[0].Page2[0].f2_62[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_63[0]', this.l34af()),
      text('topmostSubform[0].Page2[0].f2_64[0]', this.l34bc()),
      text('topmostSubform[0].Page2[0].f2_65[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_66[0]', this.l34be()),
      text('topmostSubform[0].Page2[0].f2_67[0]', undefined),
      // Lines 35-36 (not implemented)
      text('topmostSubform[0].Page2[0].f2_68[0]', undefined),
      text('topmostSubform[0].Page2[0].f2_69[0]', undefined),
      // Line 37 - real estate trust income/loss
      text('topmostSubform[0].Page2[0].f2_70[0]', this.l37()),
      // Line 38 - REMICs (not implemented)
      text(
        'topmostSubform[0].Page2[0].Table_Line38[0].Row1[0].f2_71[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line38[0].Row1[0].f2_72[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line38[0].Row1[0].f2_73[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line38[0].Row1[0].f2_74[0]',
        undefined
      ),
      text(
        'topmostSubform[0].Page2[0].Table_Line38[0].Row1[0].f2_75[0]',
        undefined
      ),
      // Lines 39-42
      text('topmostSubform[0].Page2[0].f2_76[0]', this.l39()),
      text('topmostSubform[0].Page2[0].f2_77[0]', this.l40()),
      text('topmostSubform[0].Page2[0].f2_78[0]', this.l41()),
      text(
        'topmostSubform[0].Page2[0].Line42_ReadOrder[0].f2_79[0]',
        undefined
      ),
      text('topmostSubform[0].Page2[0].f2_80[0]', undefined)
    ]
  }
}
