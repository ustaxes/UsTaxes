import { ReactElement, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
  makeStyles
} from '@material-ui/core'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Urls from 'ustaxes/data/urls'
import { setActiveYear } from 'ustaxes/redux/actions'
import { TaxYear } from 'ustaxes/core/data'

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2)
  },
  helper: {
    marginTop: theme.spacing(1),
    color: theme.palette.text.secondary
  }
}))

const ReturnWizard = (): ReactElement => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [taxYear, setTaxYear] = useState<TaxYear>('Y2024')
  const [filingStatus, setFilingStatus] = useState('Single')
  const [state, setState] = useState('OH')
  const [clientName, setClientName] = useState('Acme Holdings LLC')

  const onCreate = (): void => {
    dispatch(setActiveYear(taxYear))
    navigate(Urls.taxPayer.info)
  }

  return (
    <Box>
      <Typography variant="h5">Create New Return</Typography>
      <Typography variant="body2" className={classes.helper}>
        Start a new federal return and configure the state module stub.
      </Typography>
      <Box marginTop={2}>
        <Paper elevation={0} variant="outlined" className={classes.card}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Client Name"
                value={clientName}
                onChange={(event) => setClientName(event.target.value)}
                fullWidth
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="tax-year-label">Tax Year</InputLabel>
                <Select
                  labelId="tax-year-label"
                  value={taxYear}
                  onChange={(event) =>
                    setTaxYear(event.target.value as TaxYear)
                  }
                  label="Tax Year"
                >
                  <MenuItem value="Y2025">2025 (Beta)</MenuItem>
                  <MenuItem value="Y2024">2024</MenuItem>
                  <MenuItem value="Y2023">2023</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="filing-status-label">Filing Status</InputLabel>
                <Select
                  labelId="filing-status-label"
                  value={filingStatus}
                  onChange={(event) =>
                    setFilingStatus(event.target.value as string)
                  }
                  label="Filing Status"
                >
                  <MenuItem value="Single">Single</MenuItem>
                  <MenuItem value="MFJ">Married Filing Jointly</MenuItem>
                  <MenuItem value="MFS">Married Filing Separately</MenuItem>
                  <MenuItem value="HOH">Head of Household</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth variant="outlined" size="small">
                <InputLabel id="state-label">State</InputLabel>
                <Select
                  labelId="state-label"
                  value={state}
                  onChange={(event) => setState(event.target.value as string)}
                  label="State"
                >
                  <MenuItem value="OH">Ohio</MenuItem>
                  <MenuItem value="IL">Illinois</MenuItem>
                  <MenuItem value="TX">Texas (No State Tax)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Box marginTop={2} display="flex" justifyContent="flex-end">
            <Button variant="contained" color="primary" onClick={onCreate}>
              Create Return
            </Button>
          </Box>
          <Typography
            variant="caption"
            display="block"
            className={classes.helper}
          >
            2025 is a planning workflow until official IRS forms are released.
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default ReturnWizard
