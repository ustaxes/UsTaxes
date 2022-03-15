import { ReactElement, useState } from 'react'
import { Button, Grid, useMediaQuery } from '@mui/material'
import { useDispatch } from 'ustaxes/redux'
import * as actions from 'ustaxes/redux/actions'
import { preflightCsv, preflightCsvAll } from 'ustaxes/data/csvImport'
import { LoadRaw } from 'ustaxes/redux/fs/Load'
import DataTable, { TableColumn } from 'react-data-table-component'
import { Alert } from '@mui/material'
import {
  Portfolio,
  Position,
  processTransactions,
  Transaction,
  TransactionError
} from 'ustaxes/data/transactions'
import {
  Either,
  EitherMethods,
  isLeft,
  left,
  pure,
  pureLeft,
  right,
  run
} from 'ustaxes/core/util'
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

// The fields that must be set by the user after importing a CSV file
const fields = [
  'Security Name',
  'Transaction date',
  'Buy or Sell',
  'Price per unit',
  'Quantity'
]

export const TransactionImporter = (): ReactElement => {
  const [preflightTransactions, setPreflightTransactions] = useState<
    string[][]
  >([])

  // FieldAssignements will be an array of column indices in the imported CSV
  // to the string name of the field we want to assign to that column.
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

  const ready = () =>
    fields.every((f) => fieldAssignments.filter((a) => a === f).length === 1)

  const assignField = (colIndex: number, field: string | undefined) => {
    const newFieldAssignments = [...fieldAssignments]
    while (newFieldAssignments.length <= colIndex) {
      newFieldAssignments.push(undefined)
    }
    newFieldAssignments[colIndex] = field
    setFieldAssignments(newFieldAssignments)
  }

  const onHandle = (contents: string): void => {
    setRawContents(contents)
    run(preflightCsv(contents)).fold(
      (e) => console.error("Couldn't parse CSV", e),
      setPreflightTransactions
    )
  }

  const parseRow = (row: string[]): Either<string[], Transaction> => {
    const assignments = fieldAssignments as string[]

    const date: Either<string, Date> = (() => {
      const dateStr = row[assignments.indexOf('Transaction date')]
      try {
        return right(new Date(dateStr.slice(0, 10)))
      } catch (e) {
        return left(
          `Parsing transaction date value (${
            row[assignments.indexOf('Transaction date')]
          }) as date failed`
        )
      }
    })()

    const quantity: Either<string, number> = (() => {
      const quantityStr = row[assignments.indexOf('Quantity')]
      const v = parseFloat(quantityStr)
      if (isNaN(v)) {
        return left(`Could not parse quantity value (${quantityStr}) as number`)
      } else {
        return right(v)
      }
    })()

    const price: Either<string, number> = (() => {
      const priceStr = row[assignments.indexOf('Price per unit')]
      const v = parseFloat(priceStr)
      if (isNaN(v)) {
        return left(`Could not parse price value (${priceStr}) as number`)
      } else {
        return right(v)
      }
    })()

    // Either is a fail-fast construct, so
    // we dont (yet) have a way to nicely combine
    // errors.
    const errors = []

    if (isLeft(date)) {
      errors.push(date.left)
    }
    if (isLeft(quantity)) {
      errors.push(quantity.left)
    }
    if (isLeft(price)) {
      errors.push(price.left)
    }

    // bad if condition necessary for typechecking below.
    if (isLeft(date) || isLeft(quantity) || isLeft(price)) {
      return left(errors)
    } else {
      return right({
        security: {
          name: row[assignments.indexOf('Security Name')]
        },
        date: date.right.toISOString().slice(0, 10),
        quantity: quantity.right,
        price: price.right,
        side:
          row[assignments.indexOf('Buy or Sell')].toLowerCase() === 'buy'
            ? 'BUY'
            : 'SELL'
      })
    }
  }

  const addToPortfolio = () =>
    run(preflightCsvAll(rawContents)).fold(
      (csvReadErrors) => {
        setPortfolioError({
          messages: ['Could not parse CSV', csvReadErrors[0].message],
          errorIndex: csvReadErrors[0].row
        })
      },
      (rows) => {
        const accumulatedErrors = rows.reduce((acc, row, idx) => {
          // Skip configured header rows
          if (idx < dropFirstNRows) {
            return acc
          }
          return run(parseRow(row)).fold(
            (e) =>
              acc.fold(
                (errors) =>
                  pureLeft(errors.concat({ errorIndex: idx, messages: e })),
                () =>
                  pureLeft([
                    {
                      errorIndex: idx,
                      messages: e
                    }
                  ])
              ),
            (res) => acc.map((ts) => ts.concat(res))
          )
        }, pure<TransactionError[], Transaction[]>([]))

        const processedTransactions: EitherMethods<
          TransactionError[],
          Portfolio
        > = accumulatedErrors.chain((transactions) =>
          run(processTransactions(portfolio, transactions))
            .mapLeft((e) => [
              {
                ...e,
                messages: [
                  'This usually means you have sell transactions in excess of securities you hold at the time of sale. Either these are short sales, which are not yet supported here, or buy transactions that predate these sales are missing. If this is the case, add the required positions as BUY transactions at the beginning of this CSV file and try again.'
                ]
              }
            ])
            .value()
        )

        processedTransactions.fold(
          (errors) => {
            setPortfolioError(errors[0])
          },
          (portfolio) => {
            setPortfolioError(undefined)
            setPortfolio(portfolio)
          }
        )
      }
    )

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
          handleData={(contents: string) => onHandle(contents)}
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
