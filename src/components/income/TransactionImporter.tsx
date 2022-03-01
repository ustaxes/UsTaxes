import { ReactElement, useState } from 'react'
import { Button, Grid, useMediaQuery } from '@material-ui/core'
import { useDispatch } from 'ustaxes/redux'
import * as actions from 'ustaxes/redux/actions'
import { preflightCsv, preflightCsvAll } from 'ustaxes/data/csvImport'
import { LoadRaw } from 'ustaxes/redux/fs/Load'
import DataTable, { TableColumn } from 'react-data-table-component'
import { Alert } from '@material-ui/lab'
import {
  Portfolio,
  Position,
  processTransactions,
  Transaction,
  TransactionError
} from 'ustaxes/data/transactions'
import { Either, isLeft, left, right, run } from 'ustaxes/core/util'
import { Asset } from 'ustaxes/core/data'
import ConfigurableDataTable, {
  baseCellStyle,
  forceHeadCells
} from './ConfigurableDataTable'

interface PortfolioTableProps {
  portfolio: Portfolio
}

export const PortfolioTable = ({
  portfolio
}: PortfolioTableProps): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const columns: TableColumn<Position>[] = [
    {
      name: 'Security',
      selector: (p) => p.security.name,
      style: baseCellStyle(prefersDarkMode)
    },
    {
      name: 'Open Date',
      selector: (p) => p.openDate,
      style: baseCellStyle(prefersDarkMode)
    },
    {
      name: 'Quantity',
      selector: (p) => p.quantity,
      style: baseCellStyle(prefersDarkMode)
    },
    {
      name: 'Price per unit',
      selector: (p) => p.price,
      style: baseCellStyle(prefersDarkMode)
    },
    {
      name: 'Basis',
      selector: (p) => p.price * p.quantity,
      style: baseCellStyle(prefersDarkMode)
    },
    {
      name: 'Close Date',
      selector: (p) => p.closeDate ?? '',
      style: baseCellStyle(prefersDarkMode)
    },
    {
      name: 'Proceeds',
      selector: (p) =>
        p.closePrice !== undefined ? p.quantity * p.closePrice : '',
      style: baseCellStyle(prefersDarkMode)
    },
    {
      name: 'Gain or Loss',
      selector: (p) =>
        p.closePrice !== undefined ? (p.closePrice - p.price) * p.quantity : '',
      style: baseCellStyle(prefersDarkMode)
    }
  ]

  return (
    <DataTable
      columns={columns}
      data={portfolio.positions}
      customStyles={forceHeadCells(prefersDarkMode)}
    />
  )
}

export const TransactionImporter = (): ReactElement => {
  //  const [portfolio, createPortfolio] = useState<Portfolio>({ positions: [] })
  const [preflightTransactions, setPreflightTransactions] = useState<
    string[][]
  >([])
  const [fieldAssignments, setFieldAssignments] = useState<
    (string | undefined)[]
  >([])
  const [dropFirstNRows, setDropFirstNRows] = useState<number>(0)
  const [rawContents, setRawContents] = useState<string>('')
  const [portfolio, setPortfolio] = useState<Portfolio>({ positions: [] })
  const [portfolioError, setPortfolioError] = useState<
    TransactionError | undefined
  >(undefined)

  const dispatch = useDispatch()

  const fields = [
    'Security Name',
    'Transaction date',
    'Buy or Sell',
    'Price per unit',
    'Quantity'
  ]

  const ready = () =>
    Array.from(new Set(fieldAssignments.filter((f) => f !== undefined)))
      .length === fields.length

  const assignField = (colIndex: number, field: string | undefined) => {
    const newFieldAssignments = [...fieldAssignments]
    while (newFieldAssignments.length <= colIndex) {
      newFieldAssignments.push(undefined)
    }
    newFieldAssignments[colIndex] = field
    setFieldAssignments(newFieldAssignments)
  }

  const onHandle = async (contents: string): Promise<void> => {
    setRawContents(contents)
    const res = await preflightCsv(contents).catch((parseError) => {
      console.error("Couldn't parse CSV", parseError)
      return []
    })
    setPreflightTransactions(res)
  }

  const parseRow = (row: string[]): Either<string[], Transaction> => {
    const assignments = fieldAssignments as string[]

    const errors: string[] = []

    const date: string | undefined = (() => {
      const dateStr = row[assignments.indexOf('Transaction date')]
      try {
        return new Date(dateStr.slice(0, 10)).toISOString().slice(0, 10)
      } catch (e) {
        errors.push(
          `Parsing transaction date value (${
            row[assignments.indexOf('Transaction date')]
          }) as date failed`
        )
        return undefined
      }
    })()

    const quantity: number | undefined = (() => {
      const quantityStr = row[assignments.indexOf('Quantity')]
      const v = parseFloat(quantityStr)
      if (isNaN(v)) {
        return errors.push(
          `Could not parse quantity value (${quantityStr}) as number`
        )
      } else {
        return v
      }
    })()

    const price: number | undefined = (() => {
      const priceStr = row[assignments.indexOf('Price per unit')]
      const v = parseFloat(priceStr)
      if (isNaN(v)) {
        errors.push(`Could not parse price value (${priceStr}) as number`)
      } else {
        return v
      }
    })()

    if (quantity === undefined || price === undefined || date === undefined) {
      return left(errors)
    }

    return right({
      security: {
        name: row[assignments.indexOf('Security Name')]
      },
      date,
      quantity,
      price,
      side:
        row[assignments.indexOf('Buy or Sell')].toLowerCase() === 'buy'
          ? 'BUY'
          : 'SELL'
    })
  }

  const addToPortfolio = async () => {
    const csv = await preflightCsvAll(rawContents)
    let errorResult: TransactionError | undefined

    const transactions: Transaction[] = csv.flatMap((row, idx) => {
      if (idx < dropFirstNRows) {
        return []
      }

      const parsedRow = parseRow(row)
      if (errorResult !== undefined) {
        return []
      }
      if (isLeft(parsedRow)) {
        errorResult = {
          errorIndex: idx,
          messages: parsedRow.left,
          errorTransaction: undefined,
          previousPortfolio: undefined
        }
        return []
      } else {
        return [parsedRow.right]
      }
    })

    if (errorResult !== undefined) {
      // First deal with parsing errors, if any
      setPortfolioError(errorResult)
    } else {
      // Then deal with portfolio generating errors, if any.
      run(processTransactions({ positions: [] }, transactions)).fold(
        (e) =>
          setPortfolioError({
            ...e,
            messages: [
              'This usually means you have sell transactions in excess of securities you hold at the time of sale. Either these are short sales, which are not yet supported here, or buy transactions that predate these sales are missing. If this is the case, add the required positions as BUY transactions at the beginning of this CSV file and try again.'
            ]
          }),
        (portfolio) => {
          setPortfolioError(undefined)
          setPortfolio(portfolio)
        }
      )
    }
  }

  const readyButton = (() => {
    if (ready() && portfolio.positions.length === 0) {
      return (
        <Grid item>
          <Button variant="contained" color="primary" onClick={addToPortfolio}>
            Build Portfolio
          </Button>
        </Grid>
      )
    }
  })()

  const importable = () =>
    portfolio.positions.length > 0 && portfolioError === undefined

  const resetPortfolioBuildingState = () => {
    setPortfolio({ positions: [] })
    setRawContents('')
    setDropFirstNRows(0)
    setFieldAssignments([])
    setPreflightTransactions([])
    setPortfolioError(undefined)
  }

  const addAssets = () => {
    const assets: Asset[] = portfolio.positions.map((position) => ({
      name: position.security.name,
      openDate: new Date(position.openDate),
      openPrice: position.price,
      positionType: 'Security',
      quantity: position.quantity,
      closeDate:
        position.closeDate !== undefined
          ? new Date(position.closeDate)
          : undefined,
      closePrice: position.closePrice
    }))

    dispatch(actions.addAssets(assets))
    resetPortfolioBuildingState()
  }

  const addAssetsButton = (() => {
    if (importable()) {
      return (
        <Grid item>
          <Button variant="contained" color="primary" onClick={addAssets}>
            Add Sales and Assets
          </Button>
        </Grid>
      )
    }
  })()

  const resetButton = (() => {
    if (
      preflightTransactions.length > 0 ||
      portfolioError !== undefined ||
      portfolio.positions.length > 0
    ) {
      return (
        <Grid item>
          <Button
            variant="contained"
            color="secondary"
            onClick={resetPortfolioBuildingState}
          >
            Reset
          </Button>
        </Grid>
      )
    }
  })()

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <LoadRaw
          variant="contained"
          color="primary"
          handleData={async (contents: string) => await onHandle(contents)}
        >
          Load CSV File
        </LoadRaw>
      </Grid>

      {(() => {
        if (preflightTransactions.length > 0) {
          return (
            <>
              <Grid item xs={12}>
                <h3>Import Transactions</h3>
              </Grid>
              <Grid item xs={12}>
                <ConfigurableDataTable
                  fieldAssignments={fieldAssignments}
                  assignField={assignField}
                  fields={fields}
                  rows={preflightTransactions}
                  updateDropFirstNRows={(num) => setDropFirstNRows(num)}
                  dropFirstNRows={dropFirstNRows}
                />
              </Grid>
              <Grid container spacing={2} direction="row">
                {readyButton}
                {resetButton}
                {addAssetsButton}
              </Grid>
            </>
          )
        }
      })()}
      {(() => {
        if (portfolioError) {
          const { errorTransaction, previousPortfolio } = portfolioError

          const errorTransactionMessage = (() => {
            if (errorTransaction !== undefined) {
              const {
                side,
                security: { name },
                quantity,
                price,
                date
              } = errorTransaction

              return (
                <>
                  <h4>Erroneous transaction</h4>
                  <div>
                    <ul>
                      <li>Line {portfolioError.errorIndex + 1}</li>
                      <li>Date: {date}</li>
                      <li>{`${side} ${name} ${quantity}@${price}`}</li>
                    </ul>
                  </div>
                </>
              )
            }
          })()

          const prevPortfolioMessage = (() => {
            if (previousPortfolio !== undefined) {
              return (
                <>
                  <h4>Portfolio before erroneous transaction</h4>
                  <PortfolioTable
                    portfolio={previousPortfolio}
                  ></PortfolioTable>
                </>
              )
            }
          })()

          return (
            <Grid item xs={12}>
              <Alert severity="error">
                <h3>Transaction List Import Failed</h3>
                {errorTransactionMessage}
                {portfolioError.messages.map((message, i) => (
                  <p key={i}>{message}</p>
                ))}
              </Alert>
              {prevPortfolioMessage}
            </Grid>
          )
        }
      })()}
      {(() => {
        if (portfolio.positions.length > 0) {
          return (
            <Grid item xs={12}>
              <h3>Portfolio</h3>
              <PortfolioTable portfolio={portfolio} />
            </Grid>
          )
        }
      })()}
    </Grid>
  )
}
