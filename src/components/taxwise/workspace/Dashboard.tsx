import { ReactElement, useMemo } from 'react'
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles
} from '@material-ui/core'
import { format } from 'date-fns'
import { useSelector } from 'react-redux'
import { YearsTaxesState } from 'ustaxes/redux'
import { TaxYears, TaxYear } from 'ustaxes/core/data'
import { Link as RouterLink } from 'react-router-dom'
import Urls from 'ustaxes/data/urls'

type ReturnStatus = 'Draft' | 'Needs Review' | 'Ready to Sign'

type DashboardRow = {
  year: TaxYear
  client: string
  status: ReturnStatus
  lastUpdated: Date
  missingItems: string[]
}

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(2)
  },
  tableCell: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1)
  },
  statusDraft: {
    backgroundColor: '#e6edf5',
    color: '#1b3a57'
  },
  statusReview: {
    backgroundColor: '#fde4b3',
    color: '#7a3d00'
  },
  statusReady: {
    backgroundColor: '#d7f5e4',
    color: '#1c5c37'
  }
}))

const statusClass = (
  status: ReturnStatus,
  classes: Record<string, string>
): string => {
  if (status === 'Needs Review') return classes.statusReview
  if (status === 'Ready to Sign') return classes.statusReady
  return classes.statusDraft
}

const Dashboard = (): ReactElement => {
  const classes = useStyles()
  const activeYear = useSelector((state: YearsTaxesState) => state.activeYear)

  const rows = useMemo<DashboardRow[]>(() => {
    const today = new Date()
    return (['Y2024', 'Y2023', 'Y2022'] as TaxYear[]).map((year, index) => ({
      year,
      client: 'Acme Holdings LLC',
      status:
        year === activeYear
          ? 'Draft'
          : index === 0
          ? 'Needs Review'
          : 'Ready to Sign',
      lastUpdated: new Date(today.getTime() - index * 1000 * 60 * 60 * 24 * 7),
      missingItems:
        index === 0
          ? ['W-2', '1099-INT']
          : index === 1
          ? ['Dependents DOB']
          : []
    }))
  }, [activeYear])

  return (
    <Box>
      <div className={classes.header}>
        <div>
          <Typography variant="h5">Client Dashboard</Typography>
          <Typography variant="body2" color="textSecondary">
            Track returns, status, and missing items by year.
          </Typography>
        </div>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={Urls.app.newReturn}
        >
          New Return
        </Button>
      </div>
      <Paper elevation={0} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell className={classes.tableCell}>Year</TableCell>
              <TableCell className={classes.tableCell}>Client</TableCell>
              <TableCell className={classes.tableCell}>Status</TableCell>
              <TableCell className={classes.tableCell}>Last Updated</TableCell>
              <TableCell className={classes.tableCell}>Missing Items</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.year} hover>
                <TableCell className={classes.tableCell}>
                  {TaxYears[row.year]}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {row.client}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  <Chip
                    size="small"
                    label={row.status}
                    className={statusClass(row.status, classes)}
                  />
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {format(row.lastUpdated, 'MMM d, yyyy')}
                </TableCell>
                <TableCell className={classes.tableCell}>
                  {row.missingItems.length > 0
                    ? row.missingItems.join(', ')
                    : 'Complete'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}

export default Dashboard
