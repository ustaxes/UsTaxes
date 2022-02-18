import { ReactElement, useState } from 'react'
import { Button, Grid, TextField } from '@material-ui/core'
import { useDispatch } from 'ustaxes/redux'
import * as actions from 'ustaxes/redux/actions'
import { parseCsv, preflightCsv } from 'ustaxes/data/csvImport'
import { LoadRaw } from 'ustaxes/redux/fs/Load'
import DataTable, {
  TableColumn,
  ConditionalStyles
} from 'react-data-table-component'
import { Alert } from '@material-ui/lab'
import useStyles from '../input/styles'
import { createStyles, makeStyles } from '@material-ui/core'
import {
  Portfolio,
  Position,
  processTransactions,
  Transaction,
  TransactionError
} from 'ustaxes/data/transactions'
import { run } from 'ustaxes/core/util'
import { Asset } from 'ustaxes/core/data'

const useColumnStyles = makeStyles(() =>
  createStyles({
    column: {
      '& .MuiFilledInput-input': {
        fontSize: '.8rem',
        fontWeight: 'bold',
        padding: '0.9rem 0rem'
      }
    }
  })
)

const useRowStyles = makeStyles(() =>
  createStyles({
    disabledRow: {
      backgroundColor: '#aaaaaa',
      color: 'black'
    }
  })
)

interface ConfigurableDataTableProps {
  fields: string[]
  fieldAssignments: (string | undefined)[]
  rows: string[][]
  assignField: (colIndex: number, field: string | undefined) => void
  dropFirstNRows?: number
  updateDropFirstNRows: (dropFirstNRows: number) => void
}

interface ColumnHeaderDropProps {
  fields: string[]
  value?: string
  onChange: (field: string) => void
  undefinedName?: string
}

const ColumnHeaderDropDown = ({
  fields,
  value,
  onChange,
  undefinedName = ''
}: ColumnHeaderDropProps) => {
  const classes = useStyles()
  const columnClasses = useColumnStyles()

  return (
    <TextField
      className={`${classes.root} ${columnClasses.column}`}
      select
      fullWidth
      variant="filled"
      SelectProps={{
        native: true,
        value,
        onChange: (e) => onChange(e.target.value as string)
      }}
      InputLabelProps={{
        shrink: true
      }}
    >
      <option value={undefined}>{undefinedName}</option>
      {fields.map((field) => (
        <option value={field} key={field}>
          {field}
        </option>
      ))}
    </TextField>
  )
}

export const ConfigurableDataTable = ({
  fieldAssignments,
  fields,
  assignField,
  rows,
  dropFirstNRows = 0,
  updateDropFirstNRows
}: ConfigurableDataTableProps): ReactElement => {
  const firstRow = rows[0]
  const classes = useStyles()
  const rowClasses = useRowStyles()

  const conditionalRowStyles: ConditionalStyles<[number, string[]]> = {
    when: ([index]) => index < dropFirstNRows,
    classNames: [rowClasses.disabledRow]
  }

  const columns: TableColumn<[number, string[]]>[] = firstRow.map((c, i) => ({
    name: (
      <ColumnHeaderDropDown
        fields={fields}
        onChange={(field) => assignField(i, field)}
        value={fieldAssignments[i]}
        undefinedName={`Col ${i + 1}`}
      />
    ),
    selector: ([, row]) => row[i],
    conditionalCellStyles: [conditionalRowStyles]
  }))

  const unassignedColumns = fields.filter((c) => !fieldAssignments.includes(c))
  const errorColumns = fields.filter(
    (c) => fieldAssignments.filter((f) => f === c).length > 1
  )

  const assignAlert = (() => {
    if (unassignedColumns.length > 0) {
      return (
        <Alert severity="info">
          Assign the following fields:
          <ul>
            {unassignedColumns.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Alert>
      )
    }
  })()

  const errorAlert = (() => {
    if (errorColumns.length > 0) {
      return (
        <Alert severity="warning">
          {errorColumns.join(', ') +
            (errorColumns.length > 1 ? ' fields are' : ' field is')}{' '}
          assigned more than once:
        </Alert>
      )
    }
  })()

  const dropFirstNRowsInput = (
    <TextField
      className={classes.root}
      label="Drop first n rows"
      value={dropFirstNRows}
      onChange={(v) => {
        try {
          updateDropFirstNRows(parseInt(v.target.value))
        } catch {
          updateDropFirstNRows(0)
        }
      }}
    />
  )

  return (
    <>
      {assignAlert}
      {errorAlert}
      <Grid item xs={12}>
        {dropFirstNRowsInput}
      </Grid>
      <Grid item xs={12}>
        <DataTable<[number, string[]]>
          data={rows.map((r, i) => [i, r])}
          columns={columns}
        />
      </Grid>
    </>
  )
}

interface PortfolioTableProps {
  portfolio: Portfolio
}

export const PortfolioTable = ({
  portfolio
}: PortfolioTableProps): ReactElement => {
  const columns: TableColumn<Position>[] = [
    {
      name: 'Security',
      selector: (p) => p.security.name
    },
    {
      name: 'Open Date',
      selector: (p) => p.openDate
    },
    {
      name: 'Quantity',
      selector: (p) => p.quantity
    },
    {
      name: 'Price per unit',
      selector: (p) => p.price
    },
    {
      name: 'Basis',
      selector: (p) => p.price * p.quantity
    },
    {
      name: 'Close Date',
      selector: (p) => p.closeDate ?? ''
    },
    {
      name: 'Proceeds',
      selector: (p) =>
        p.closePrice !== undefined ? p.quantity * p.closePrice : ''
    },
    {
      name: 'Gain or Loss',
      selector: (p) =>
        p.closePrice !== undefined ? (p.closePrice - p.price) * p.quantity : ''
    }
  ]

  return <DataTable columns={columns} data={portfolio.positions} />
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

  const parseRow = (row: string[]): Transaction => {
    const assignments = fieldAssignments as string[]
    return {
      security: {
        name: row[assignments.indexOf('Security Name')]
      },
      date: new Date(row[assignments.indexOf('Transaction date')].slice(0, 10))
        .toISOString()
        .slice(0, 10),
      quantity: parseFloat(row[assignments.indexOf('Quantity')]),
      price: parseFloat(row[assignments.indexOf('Price per unit')]),
      side:
        row[assignments.indexOf('Buy or Sell')].toLowerCase() === 'buy'
          ? 'BUY'
          : 'SELL'
    }
  }

  const addToPortfolio = async () => {
    const transactions: Transaction[] = await parseCsv<Transaction>(
      rawContents,
      (row, num) => (num >= dropFirstNRows ? [parseRow(row)] : [])
    )

    run(processTransactions({ positions: [] }, transactions)).fold(
      setPortfolioError,
      (portfolio) => {
        setPortfolioError(undefined)
        setPortfolio(portfolio)
      }
    )
  }

  const readyButton = (() => {
    if (ready() && portfolio.positions.length === 0) {
      return (
        <Button variant="contained" color="primary" onClick={addToPortfolio}>
          Build Portfolio
        </Button>
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
        <Button variant="contained" color="primary" onClick={addAssets}>
          Add Sales and Assets
        </Button>
      )
    }
  })()

  const resetButton = (() => {
    if (ready() && portfolio.positions.length > 0) {
      return (
        <Button
          variant="contained"
          color="secondary"
          onClick={resetPortfolioBuildingState}
        >
          Reset
        </Button>
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
              {readyButton}
              {resetButton}
              {addAssetsButton}
            </>
          )
        }
      })()}
      {(() => {
        if (portfolioError) {
          const {
            errorTransaction: {
              side,
              security: { name },
              quantity,
              price
            },
            previousPortfolio
          } = portfolioError

          return (
            <Grid item xs={12}>
              <Alert severity="error">
                <h3>Transaction List Import Failed</h3>
                <h4>Erroneous transaction</h4>
                <div>
                  <ul>
                    <li>Line {portfolioError.errorIndex + 1}</li>
                    <li>Date: {portfolioError.errorTransaction.date}</li>
                    <li>{`${side} ${name} ${quantity}@${price}`}</li>
                  </ul>
                </div>
                <p>
                  This usually means you have sell transactions in excess of
                  securities you hold at the time of sale. Either these are
                  short sales, which are not yet supported here, or buy
                  transactions that predate these sales are missing. If this is
                  the case, add the required positions as BUY transactions at
                  the beginning of this CSV file and try again.
                </p>
              </Alert>
              <h4>Portfolio before erroneous transaction</h4>
              <PortfolioTable portfolio={previousPortfolio}></PortfolioTable>
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
