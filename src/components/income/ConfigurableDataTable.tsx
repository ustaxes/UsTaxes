import { Alert, Grid, TextField, useMediaQuery } from '@mui/material'
import { ReactElement } from 'react'
import DataTable, {
  ConditionalStyles,
  TableColumn
} from 'react-data-table-component'
import { styled } from '@mui/material/styles'

const PREFIX = 'ConfigurableDataTable'

const classes = {
  root: `${PREFIX}-root`,
  column: `${PREFIX}-column`,
  normal: `${PREFIX}-normal`,
  disabledRow: `${PREFIX}-disabledRow`
}

export const baseLight = {
  color: 'rgba(0, 0, 0, 0.54)',
  backgroundColor: 'white'
}

export const baseDark = {
  color: 'white',
  backgroundColor: '#303030'
}

const Root = styled('div')(() => ({
  [`${PREFIX}-disabledRow`]: {
    backgroundColor: '#aaaaaa',
    color: 'black'
  },
  [`${PREFIX}-normal`]: baseLight,
  [`${PREFIX}-normal .dark`]: baseDark,
  [`${PREFIX}-column`]: {
    '& .MuiFilledInput-input': {
      fontSize: '.8rem',
      fontWeight: 'bold',
      padding: '0.9rem 0rem',
      ...baseLight
    }
  },
  [`${PREFIX}-column .dark`]: {
    '& .MuiFilledInput-input': baseDark
  }
}))

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
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <TextField
      className={`${classes.root} ${classes.column} ${
        prefersDarkMode ? '.dark' : ''
      }`}
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

interface ConfigurableDataTableProps {
  fields: string[]
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

  const conditionalCellStyles: ConditionalStyles<[number, string[]]>[] = [
    {
      when: ([index]) => index < dropFirstNRows,
      classNames: [classes.disabledRow]
    },
    {
      when: ([index]) => index >= dropFirstNRows,
      classNames: [classes.normal]
    }
  ]

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
    conditionalCellStyles
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
        const newv = parseInt(v.target.value)
        updateDropFirstNRows(isNaN(newv) ? 0 : newv)
      }}
    />
  )

  return (
    <Root>
      {assignAlert}
      {errorAlert}
      <Grid item xs={12}>
        {dropFirstNRowsInput}
      </Grid>
      <Grid item xs={12}>
        <DataTable<[number, string[]]>
          data={rows.map((r, i) => [i, r])}
          columns={columns}
          customStyles={{
            headCells: { style: prefersDarkMode ? baseDark : baseLight }
          }}
        />
      </Grid>
    </Root>
  )
}

export default ConfigurableDataTable
