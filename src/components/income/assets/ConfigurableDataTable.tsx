import { Grid, TextField, useMediaQuery } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { ReactElement } from 'react'
import DataTable, {
  ConditionalStyles,
  TableColumn
} from 'react-data-table-component'
import useStyles from '../../input/styles'
import { columnInputStyles, useRowStyles } from './DataTableStyle'

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
  const columnClasses = columnInputStyles()

  return (
    <TextField
      className={columnClasses.column}
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

export interface ColumnDef {
  name: string
  required?: boolean
}

interface ConfigurableDataTableProps {
  fields: ColumnDef[]
  fieldAssignments: (string | undefined)[]
  rows: string[][]
  assignField: (colIndex: number, field: string | undefined) => void
  dropFirstNRows?: number
  updateDropFirstNRows: (dropFirstNRows: number) => void
}

export const ConfigurableDataTable = ({
  fieldAssignments,
  fields,
  assignField,
  rows,
  dropFirstNRows = 0,
  updateDropFirstNRows
}: ConfigurableDataTableProps): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const firstRow = rows[0]
  const classes = useStyles()

  const rowClasses = useRowStyles({ prefersDarkMode })

  const conditionalCellStyles: ConditionalStyles<[number, string[]]>[] = [
    {
      when: ([index]) => index < dropFirstNRows,
      classNames: [rowClasses.disabledRow]
    },
    {
      when: ([index]) => index >= dropFirstNRows,
      classNames: [rowClasses.normal]
    }
  ]

  const columns: TableColumn<[number, string[]]>[] = firstRow.map((c, i) => ({
    name: (
      <ColumnHeaderDropDown
        fields={fields.map((f) => f.name)}
        onChange={(field) => assignField(i, field)}
        value={fieldAssignments[i]}
        undefinedName={`Col ${i + 1}`}
      />
    ),
    selector: ([, row]) => row[i],
    conditionalCellStyles
  }))

  const unassignedColumns = fields.filter(
    (c) => c.required && !fieldAssignments.includes(c.name)
  )
  const errorColumns = fields.filter(
    (c) => c.required && fieldAssignments.filter((f) => f === c.name).length > 1
  )

  const assignAlert = (() => {
    if (unassignedColumns.length > 0) {
      return (
        <Alert severity="info">
          Assign the following fields:
          <ul>
            {unassignedColumns.map((c) => (
              <li key={c.name}>{c.name}</li>
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
          {errorColumns.map((c) => c.name).join(', ') +
            (errorColumns.length > 1 ? ' fields are' : ' field is')}{' '}
          assigned more than once.
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
        const newv = parseInt(v.target.value)
        updateDropFirstNRows(isNaN(newv) ? 0 : newv)
      }}
    />
  )

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        {assignAlert}
        {errorAlert}
      </Grid>
      <Grid item xs={12}>
        {dropFirstNRowsInput}
      </Grid>
      <Grid item xs={12}>
        <DataTable<[number, string[]]>
          data={rows.map((r, i) => [i, r])}
          columns={columns}
          theme={prefersDarkMode ? 'dark' : 'normal'}
        />
      </Grid>
    </Grid>
  )
}

export default ConfigurableDataTable
