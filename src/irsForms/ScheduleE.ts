import { Address, Information, Property, PropertyType, PropertyExpenseTypeName } from '../redux/data'
import Form from './Form'
import TaxPayer from '../redux/TaxPayer'
import { anArrayOf, unzip3, zip, zip3 } from '../util'
import F6168 from './F6168'
import F8582 from './F8582'
import { displayNumber, sumFields } from './util'

type Cell = number | undefined
export type MatrixRow = [Cell, Cell, Cell]

const unimplemented = (message: string): void =>
  console.warn(`[Schedule E] unimplemented ${message}`)

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
  [PropertyType.royalties]: 6,
  [PropertyType.selfRental]: 7,
  [PropertyType.other]: 8
}

export default class ScheduleE implements Form {
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
      this.state.realEstate.map((p) =>
        p.expenses[expType] ?? 0
      )
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

  l20 = (): MatrixRow => fill(unzip3(this.allExpenses()).map((column) => sumFields(column)))

  l21 = (): MatrixRow => (
    zip3(this.l3(), this.l4(), this.l20())
      .map(([x, y, z]) => (x ?? 0) + (y ?? 0) - (z ?? 0))
  ) as MatrixRow

  l22 = (): MatrixRow => this.f8582.deductibleRealEstateLossAfterLimitation()

  l24 = (): number => sumFields(this.l21().filter((x) => x !== undefined && x > 0))
  l25 = (): number => (
    sumFields(this.l21().filter((x) => x !== undefined && x < 0)) +
    sumFields(this.l22())
  )

  l26 = (): number => sumFields([this.l24(), this.l25()])

  rentalNet = (): MatrixRow => (
    zip(this.l3(), this.l20()).map(([x, y]) => (x ?? 0) - (y ?? 0))
  ) as MatrixRow

  l32 = (): number | undefined => {
    unimplemented('Partnership and S corporation income or loss')
    return displayNumber(0)
  }

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
      sumFields(this.l3()),
      sumFields(this.l4()),
      sumFields(this.l12()),
      sumFields(this.l18()),
      sumFields(this.l20()),
      this.l24(),
      this.l25(),
      this.l26(),
      // Page 2 - TODO: completely unimplemented
      tp.namesString(),
      tp.tp.primaryPerson?.ssid,
      ...[false, false], // l27
      ...anArrayOf(6 * 4 + 5 * 4, undefined), // l28
      ...anArrayOf(5 * 2, undefined), // l29
      undefined, // l30
      undefined, // l31
      this.l32(), // l32
      ...anArrayOf(2 * 4, undefined), // l33
      ...anArrayOf(4 * 2, undefined), // l34
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
