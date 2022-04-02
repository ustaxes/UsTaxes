import {
  createStyles,
  Grid,
  makeStyles,
  TextField,
  Theme,
  useMediaQuery
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { ReactElement } from 'react'
import DataTable, {
  ConditionalStyles,
  TableColumn
} from 'react-data-table-component'
import useStyles from '../../input/styles'

type DarkModeProps = {
  prefersDarkMode: boolean
}

const useRowStyles = makeStyles<Theme, DarkModeProps>(() =>
  createStyles({
    disabledRow: {
      backgroundColor: '#aaaaaa',
      color: 'black'
    },
    normal: ({ prefersDarkMode }) => baseCellStyle(prefersDarkMode)
  })
)

export const baseCellStyle = (
  prefersDarkMode = false
): { [k: string]: string } => ({
  color: prefersDarkMode ? 'white' : 'rgba(0, 0, 0, 0.54)',
  backgroundColor: prefersDarkMode ? '#303030' : 'white'
})

const useColumnStyles = makeStyles<Theme, DarkModeProps>(() =>
  createStyles({
    column: ({ prefersDarkMode }) => ({
      '& .MuiFilledInput-input': {
        fontSize: '.8rem',
        fontWeight: 'bold',
        padding: '0.9rem 0rem',
        ...baseCellStyle(prefersDarkMode)
      }
    })
  })
)

export const forceHeadCells = (
  prefersDarkMode = false
): { headCells: { style: { [k: string]: string } } } => ({
  headCells: { style: baseCellStyle(prefersDarkMode) }
})

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
  const classes = useStyles({ prefersDarkMode })
  const columnClasses = useColumnStyles({ prefersDarkMode })

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
          customStyles={forceHeadCells(prefersDarkMode)}
        />
      </Grid>
    </>
  )
}

export default ConfigurableDataTable
