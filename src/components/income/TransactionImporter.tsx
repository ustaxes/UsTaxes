import { ReactElement, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { Grid, TextField } from '@material-ui/core'
import { preflightCsv } from 'ustaxes/data/csvImport'
import { LoadRaw } from 'ustaxes/redux/fs/Load'
import DataTable from 'react-data-table-component'
import { Alert } from '@material-ui/lab'
import useStyles from '../input/styles'

interface ConfigurableDataTableProps {
  fields: string[]
  fieldAssignments: (string | undefined)[]
  rows: string[][]
  assignField: (colIndex: number, field: string | undefined) => void
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

  return (
    <TextField
      className={classes.root}
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
  rows
}: ConfigurableDataTableProps): ReactElement => {
  const firstRow = rows[0]

  const columns = firstRow.map((c, i) => ({
    name: (
      <ColumnHeaderDropDown
        fields={fields}
        onChange={(field) => assignField(i, field)}
        value={fieldAssignments[i]}
        undefinedName={`Col ${i + 1}`}
      />
    ),
    selector: (row: string[]) => row[i]
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
            (errorColumns.length > 1 ? 'fields are' : 'field is')}{' '}
          assigned more than once:
        </Alert>
      )
    }
  })()

  return (
    <>
      {assignAlert}
      {errorAlert}
      <DataTable data={rows} columns={columns} />
    </>
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

  const assignField = (colIndex: number, field: string | undefined) => {
    const newFieldAssignments = [...fieldAssignments]
    while (newFieldAssignments.length <= colIndex) {
      newFieldAssignments.push(undefined)
    }
    newFieldAssignments[colIndex] = field
    setFieldAssignments(newFieldAssignments)
  }

  const onHandle = async (contents: string): Promise<void> => {
    const res = await preflightCsv(contents).catch((parseError) => {
      console.error("Couldn't parse CSV", parseError)
      return []
    })
    setPreflightTransactions(res)
  }

  return (
    <Grid item xs={isMobile && 12}>
      <LoadRaw
        variant="contained"
        color="primary"
        handleData={async (contents: string) => await onHandle(contents)}
      >
        Load CSV File
      </LoadRaw>

      {(() => {
        if (preflightTransactions.length > 0) {
          return (
            <ConfigurableDataTable
              fieldAssignments={fieldAssignments}
              assignField={assignField}
              fields={[
                'Security Name',
                'Transaction date',
                'Buy or Sell',
                'Price per unit',
                'Quantity'
              ]}
              rows={preflightTransactions}
            />
          )
        }
      })()}
    </Grid>
  )
}
