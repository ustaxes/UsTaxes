import { Address, Information, Property, PropertyType, PropertyExpenseTypeName } from '../redux/data'
import Form, { FormTag } from './Form'
import TaxPayer from '../redux/TaxPayer'
import { anArrayOf, unzip3, zip, zip3 } from '../util'
import F6168 from './F6168'
import F8582 from './F8582'
import { displayNegPos, displayNumber, sumFields } from './util'
import log from '../log'

type Cell = number | undefined
export type MatrixRow = [Cell, Cell, Cell]

const unimplemented = (message: string): void =>
  log.warn(`[Schedule E] unimplemented ${message}`)

const fill = (values: number[]): MatrixRow => {
  const realValues = (
    (values as Cell[])
      .slice(0, 3)
      .map((v) => {
        if (v === 0) {
          return undefined
        }
        return v
      })
  )
  return [...realValues, ...Array.from(Array(3 - realValues.length)).map(() => undefined)] as MatrixRow
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

export default class ScheduleE implements Form {
  tag: FormTag = 'f1040se'
  state: Information
  f6168: F6168
  f8582: F8582

  constructor (info: Information) {
    this.state = info
    this.f6168 = new F6168(info.taxPayer, this)
    this.f8582 = new F8582(info.taxPayer, this)
  }

  addressString = (address: Address): string => ([
    address.address,
    address.city,
    address.state ?? address.province ?? '',
    address.zip ?? address.postalCode ?? ''
  ].join(', '))

  propForRow = (row: number): Property | undefined => {
    if (row < this.state.realEstate.length) {
      return this.state.realEstate[row]
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
    const properties = this.state.realEstate
    return fill(properties.map((a) => a.rentReceived))
  }

  l4 = (): MatrixRow => {
    unimplemented('Line 4: Royalties')

    return [undefined, undefined, undefined]
  }

  getExpensesRow = (expType: PropertyExpenseTypeName): MatrixRow =>
    fill(
      this.state.realEstate.map((p) => {
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
    const otherText = (
      this.state.realEstate
        .flatMap((p) => p.otherExpenseType !== undefined ? [p.otherExpenseType] : [])
        .join(',')
    )
    return [otherText, expenseRow]
  }

  allExpenses = (): MatrixRow[] =>
    this.expenses.map((e) => this.getExpensesRow(e))

  l12 = (): MatrixRow => this.getExpensesRow('mortgage')
  l18 = (): MatrixRow => this.getExpensesRow('depreciation')

  // TODO - required from pub 596 worksheet 1
  royaltyExpenses = (): number | undefined => undefined

  l20 = (): MatrixRow => fill(unzip3(this.allExpenses()).map((column) => sumFields(column)))

  l21 = (): MatrixRow => (
    zip3(this.l3(), this.l4(), this.l20())
      .map(([x, y, z]) => displayNumber((x ?? 0) + (y ?? 0) - (z ?? 0)))
  ) as MatrixRow

  // Deductible real estate loss from 8582, as positive number
  l22 = (): MatrixRow =>
    this.f8582.deductibleRealEstateLossAfterLimitation()

  l23a = (): number => sumFields(this.l3())
  l23b = (): number => sumFields(this.l4())
  l23c = (): number => sumFields(this.l12())
  l23d = (): number => sumFields(this.l18())
  l23e = (): number => sumFields(this.l20())

  rentalNet = (): MatrixRow => (
    zip(this.l3(), this.l20()).map(([x, y]) => (x ?? 0) - (y ?? 0))
  ) as MatrixRow

  l24 = (): number =>
    sumFields(this.l21().filter((x) => x !== undefined && x > 0))

  l25 = (): number => {
    unimplemented('Ignoring royalty losses on L25')
    return sumFields(this.l22())
  }

  l26 = (): number => sumFields([this.l24(), this.l25()])

  // TODO: required from Pub 596
  l29ah = (): number | undefined => undefined
  l29ak = (): number | undefined => undefined

  l29bg = (): number | undefined => undefined
  l29bi = (): number | undefined => undefined
  l29bj = (): number | undefined => undefined

  l32 = (): number | undefined => {
    unimplemented('Partnership and S corporation income or loss')
    return displayNumber(0)
  }

  l34ad = (): number | undefined => undefined
  l34af = (): number | undefined => undefined
  l34bc = (): number | undefined => undefined
  l34be = (): number | undefined => undefined

  l37 = (): number | undefined => {
    unimplemented('Real estate trust income or loss')
    return displayNumber(0)
  }

  l39 = (): number | undefined => {
    unimplemented('REMICS income or loss')
    return displayNumber(0)
  }

  l40 = (): number | undefined => {
    unimplemented('Farm rental income or loss')
    return displayNumber(0)
  }

  l41 = (): number => sumFields([
    this.l26(),
    this.l32(),
    this.l37(),
    this.l39(),
    this.l40()
  ])

  fields = (): Array<string | number | boolean | undefined> => {
    const tp = new TaxPayer(this.state.taxPayer)
    const [p0, p1, p2] = [0, 1, 2].map((i) => this.propForRow(i))

    return [
      tp.namesString(),
      tp.tp.primaryPerson?.ssid,
      false, false,
      false, false,
      ...([p0, p1, p2].map((p) => p === undefined ? undefined : this.addressString(p.address))),
      p0 === undefined ? undefined : propTypeIndex[PropertyType[p0.propertyType]],
      p1 === undefined ? undefined : propTypeIndex[PropertyType[p1.propertyType]],
      p2 === undefined ? undefined : propTypeIndex[PropertyType[p2.propertyType]],
      p0?.rentalDays, p0?.personalUseDays, p0?.qualifiedJointVenture,
      p1?.rentalDays, p1?.personalUseDays, p1?.qualifiedJointVenture,
      p2?.rentalDays, p2?.personalUseDays, p2?.qualifiedJointVenture,
      [p0, p1, p2].find((p) => p?.propertyType === 'other')?.otherPropertyType ?? undefined,
      ...(this.l3()),
      ...(this.l4()),
      ...(this.allExpenses().flat()),
      ...(this.l19().flat()),
      ...(this.l20()),
      ...(this.l21()),
      ...(this.l22()),
      displayNumber(this.l23a()),
      displayNumber(this.l23b()),
      displayNumber(this.l23c()),
      displayNumber(this.l23d()),
      displayNumber(this.l23e()),
      displayNumber(this.l24()),
      displayNumber(Math.abs(this.l25())),
      displayNegPos(this.l26()),
      // Page 2 - TODO: completely unimplemented
      tp.namesString(),
      tp.tp.primaryPerson?.ssid,
      ...[false, false], // l27
      ...anArrayOf(6 * 4 + 5 * 4, undefined), // l28
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
      undefined, // l30
      undefined, // l31
      this.l32(), // l32
      ...anArrayOf(2 * 4, undefined), // l33
      undefined,
      this.l34ad(),
      undefined,
      this.l34af(),
      ...anArrayOf(4, undefined),
      this.l34bc(),
      undefined, // grey
      this.l34be(),
      undefined, // grey
      // l34b
      undefined, // l35
      undefined, // l36
      this.l37(), // l37
      ...anArrayOf(5 + 4, undefined), // l38
      this.l39(), // l39
      this.l40(), // l40
      this.l41(), // l41
      undefined,
      undefined
    ]
  }
}
