import * as arbitraries from './arbitraries'
import fc, { Arbitrary } from 'fast-check'
import {
  Portfolio,
  Transaction,
  processTransaction,
  Security
} from 'ustaxes/data/transactions'

describe('Transactions', () => {
  test('For any portfolio, selling a security not held throws', () => {
    const testArb: Arbitrary<[Security, Portfolio]> = arbitraries
      .securities({ minLength: 2 })
      .chain((securities) =>
        arbitraries
          .portfolio(securities.slice(1))
          .map((portfolio) => [securities[0], portfolio])
      )

    fc.assert(
      fc.property(
        testArb,
        arbitraries.transaction(),
        ([newSecurity, portfolio], transaction) => {
          const applyTransaction: Transaction = {
            ...transaction,
            side: 'SELL',
            security: newSecurity
          }
          expect(() => processTransaction(portfolio, applyTransaction)).toThrow(
            new Error('Transaction list failed')
          )
        }
      )
    )
  })

  test('For any portfolio, buying anything appends one position to the portfolio', () => {
    fc.assert(
      fc.property(
        arbitraries.portfolio(),
        arbitraries.transaction(),
        (portfolio, transaction) => {
          const purchase: Transaction = {
            ...transaction,
            side: 'BUY'
          }
          const newPortfolio = processTransaction(portfolio, purchase)
          const dropOne = {
            ...newPortfolio,
            positions: newPortfolio.positions.slice(
              0,
              newPortfolio.positions.length - 1
            )
          }
          const last = newPortfolio.positions[newPortfolio.positions.length - 1]

          // Portfolio before buy is unaffected
          expect(portfolio).toEqual(dropOne)

          // Buy adds a position equivalent to buying in an empty portfolio
          expect(processTransaction({ positions: [] }, purchase)).toEqual({
            positions: [last]
          })
        }
      )
    )
  })

  const buyTransactions: Arbitrary<Transaction[]> = arbitraries
    .securities()
    .chain((securities) =>
      fc.array(
        arbitraries.transaction(securities).map((t) => ({ ...t, side: 'BUY' }))
      )
    )

  // Add a strictly smaller list of the same transactions changed to sells.
  const buysAndSells: Arbitrary<[Transaction[], Transaction[]]> =
    buyTransactions.chain((buys) =>
      fc
        .subarray(buys.map<Transaction>((buy) => ({ ...buy, side: 'SELL' })))
        .map((sells) => [buys, sells])
    )

  const buysAndScaledSells: Arbitrary<[Transaction[], Transaction[]]> =
    buysAndSells.chain(([buys, sells]) => {
      return fc
        .tuple(fc.nat({ max: 1000 }), fc.float({ min: 0.2, max: 1.0 }))
        .map(([numDays, scale]) => [
          buys,
          sells.map((t) => {
            const newDate = new Date(t.date)
            newDate.setDate(newDate.getDate() + numDays)

            return {
              ...t,
              quantity: Math.floor(t.quantity * scale),
              date: newDate.toISOString().slice(0, 10)
            }
          })
        ])
    })

  const transactions: Arbitrary<Transaction[]> = buysAndScaledSells.map(
    ([buys, sells]) =>
      [...buys, ...sells].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
  )

  test('For any (valid) list of transactions, the final portfolio has the same sum of quanities as the transaction list', () => {
    fc.assert(
      fc.property(transactions, (transactions) => {
        const portfolio = transactions.reduce<Portfolio>(
          (p, t) => processTransaction(p, t),
          { positions: [] }
        )

        const transactionCounts = transactions
          .map<[string, number]>((t) => [
            t.security.name,
            t.side === 'BUY' ? t.quantity : -t.quantity
          ])
          .reduce<{
            [name: string]: number
          }>(
            (acc, [name, quantity]) => ({
              ...acc,
              [name]: (acc[name] ?? 0) + quantity
            }),
            {}
          )

        const portfolioCounts = portfolio.positions
          .filter((p) => p.closeDate === undefined)
          .reduce<{
            [name: string]: number
          }>(
            (acc, p) => ({
              ...acc,
              [p.security.name]: (acc[p.security.name] ?? 0) + p.quantity
            }),
            {}
          )

        expect(transactionCounts).toEqual(portfolioCounts)
      })
    )
  })

  test('For any (valid) list of transactions, the final portfolio has the same sum of buys and sells', () => {
    fc.assert(
      fc.property(transactions, (transactions) => {
        const portfolio = transactions.reduce<Portfolio>(
          (p, t) => processTransaction(p, t),
          { positions: [] }
        )

        const transactionCounts = transactions.reduce<{
          [name: string]: { basis: number; proceeds: number }
        }>(
          (acc, t) => ({
            ...acc,
            [t.security.name]: {
              basis:
                (acc[t.security.name]?.basis ?? 0) +
                (t.side === 'BUY' ? t.quantity * t.price : 0),
              proceeds:
                (acc[t.security.name]?.proceeds ?? 0) +
                (t.side === 'SELL' ? t.quantity * t.price : 0)
            }
          }),
          {}
        )

        const portfolioCounts = portfolio.positions.reduce<{
          [name: string]: { basis: number; proceeds: number }
        }>(
          (acc, p) => ({
            ...acc,
            [p.security.name]: {
              basis: (acc[p.security.name]?.basis ?? 0) + p.price * p.quantity,
              proceeds:
                (acc[p.security.name]?.proceeds ?? 0) +
                (p.closePrice ?? 0) * p.quantity
            }
          }),
          {}
        )

        expect(transactionCounts).toEqual(portfolioCounts)
      })
    )
  })
})
