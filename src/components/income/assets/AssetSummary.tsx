import { ReactElement } from 'react'
import DataTable, { TableColumn } from 'react-data-table-component'
import { Currency } from 'ustaxes/components/input'
import { Asset } from 'ustaxes/core/data'
import { numberOfDaysBetween } from 'ustaxes/core/util'

interface AssetSummaryProps {
  title: string
  assets: Asset<Date>[]
}

const AssetSummary = ({ title, assets }: AssetSummaryProps): ReactElement => {
  const totals = assets.reduce(
    (acc, a) => {
      const isLongTerm =
        numberOfDaysBetween(
          a.openDate,
          a.closeDate !== undefined ? a.closeDate : new Date()
        ) > 365

      return {
        ...acc,
        longTermCostBasis:
          isLongTerm && a.closePrice !== undefined
            ? acc.longTermCostBasis + a.openPrice * a.quantity + a.openFee
            : acc.longTermCostBasis,
        shortTermCostBasis:
          !isLongTerm && a.closePrice !== undefined
            ? acc.shortTermCostBasis + a.openPrice * a.quantity + a.openFee
            : acc.shortTermCostBasis,
        longTermProceeds:
          isLongTerm && a.closePrice !== undefined
            ? acc.longTermProceeds +
              a.closePrice * a.quantity -
              (a.closeFee ?? 0)
            : acc.longTermProceeds,
        shortTermProceeds:
          !isLongTerm && a.closePrice !== undefined
            ? acc.shortTermProceeds +
              a.closePrice * a.quantity -
              (a.closeFee ?? 0)
            : acc.shortTermProceeds,
        openCostBasis:
          a.closeDate === undefined
            ? acc.openCostBasis + a.openPrice * a.quantity + a.openFee
            : acc.openCostBasis
      }
    },
    {
      longTermCostBasis: 0,
      longTermProceeds: 0,
      shortTermCostBasis: 0,
      shortTermProceeds: 0,
      openCostBasis: 0
    }
  )

  const columns: TableColumn<{
    name: string
    shortTerm: number
    longTerm: number
  }>[] = [
    {
      name: '',
      selector: ({ name }) => name
    },
    {
      name: 'Short Term',
      cell: ({ shortTerm }) => <Currency value={shortTerm} />
    },
    {
      name: 'Long Term',
      cell: ({ longTerm }) => <Currency value={longTerm} />
    },
    {
      name: 'Total',
      cell: ({ shortTerm, longTerm }) => (
        <Currency value={shortTerm + longTerm} />
      )
    }
  ]

  const data: Array<{ name: string; shortTerm: number; longTerm: number }> = [
    {
      name: 'Cost Basis',
      shortTerm: totals.shortTermCostBasis,
      longTerm: totals.longTermCostBasis
    },
    {
      name: 'Proceeds',
      shortTerm: totals.shortTermProceeds,
      longTerm: totals.longTermProceeds
    },
    {
      name: 'Gain/Loss',
      shortTerm: totals.shortTermProceeds - totals.shortTermCostBasis,
      longTerm: totals.longTermProceeds - totals.longTermCostBasis
    }
  ]

  const totalFees = assets.reduce(
    (acc, a) => acc + a.openFee + (a.closeFee ?? 0),
    0
  )

  return (
    <>
      <DataTable title={title} columns={columns} data={data} />
      {(() => {
        if (totalFees > 0) {
          return (
            <p>
              Cost basis and proceeds include{' '}
              <Currency plain value={totalFees} /> in fees.
            </p>
          )
        }
      })()}
    </>
  )
}

export default AssetSummary
