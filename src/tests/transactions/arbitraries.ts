import fc, { Arbitrary } from 'fast-check'
import {
  Portfolio,
  Position,
  Security,
  Side,
  Transaction
} from 'ustaxes/data/transactions'

export const security = (): Arbitrary<Security> =>
  fc.string({ minLength: 1, maxLength: 5 }).map((name) => ({ name }))

export const securities = (config = { minLength: 1 }): Arbitrary<Security[]> =>
  fc
    .set(fc.string({ minLength: 1, maxLength: 5 }), {
      minLength: config.minLength
    })
    .map((names) => names.map((name) => ({ name })))

const dateStr = (): Arbitrary<string> =>
  fc
    .date({
      min: new Date('2018-01-01'),
      max: new Date('2022-12-31')
    })
    .map((d) => d.toISOString().substring(0, 10))

export const transaction = (securities?: Security[]): Arbitrary<Transaction> =>
  fc
    .tuple(
      securities === undefined ? security() : fc.constantFrom(...securities),
      dateStr(),
      fc.constantFrom<Side>('BUY', 'SELL'),
      fc.float({ min: 0 }),
      //      fc.float({ min: 0.0001 })
      fc.integer({ min: 1, max: 1000 })
    )
    .map(([security, date, side, price, quantity]) => ({
      security,
      date,
      side,
      price,
      quantity
    }))

export const position = (securities?: Security[]): Arbitrary<Position> =>
  fc.oneof(dateStr(), fc.constant(undefined)).chain((closeDate) =>
    fc
      .tuple(
        securities === undefined ? security() : fc.constantFrom(...securities),
        fc.integer({ min: 1, max: 100 }),
        fc.float({ min: 0 }),
        dateStr(),
        fc.float({ min: 0 })
      )
      .map(([security, quantity, price, openDate, closePrice]) => ({
        security,
        quantity,
        price,
        openDate,
        closeDate,
        closePrice: closeDate === undefined ? undefined : closePrice
      }))
  )

export const portfolio = (securities?: Security[]): Arbitrary<Portfolio> =>
  fc
    .array(position(securities))
    .map((positions) =>
      positions.sort(
        (a, b) =>
          new Date(a.openDate).getTime() - new Date(b.openDate).getTime()
      )
    )
    .map((positions) => ({ positions }))
