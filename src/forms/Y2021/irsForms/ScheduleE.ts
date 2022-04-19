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
import { Field } from 'ustaxes/core/pdfFiller'

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
   * the unit as a home in 2020. You used the unit as a home if your personal use of the unit
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
      this.f1040.info.namesString(),
      this.f1040.info.taxPayer.primaryPerson?.ssid,
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
      this.f1040.info.namesString(),
      this.f1040.info.taxPayer.primaryPerson?.ssid,
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
}
