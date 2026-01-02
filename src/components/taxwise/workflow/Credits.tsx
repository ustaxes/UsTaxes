import { ReactElement } from 'react'
import {
  Box,
  Checkbox,
  FormControlLabel,
  Paper,
  Typography,
  makeStyles
} from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2)
  },
  stack: {
    display: 'grid',
    gap: theme.spacing(1)
  }
}))

const Credits = (): ReactElement => {
  const classes = useStyles()

  return (
    <Box>
      <Typography variant="h5">Credits Overview</Typography>
      <Typography variant="body2" color="textSecondary">
        Capture eligibility quickly and jump into credit-specific worksheets.
      </Typography>
      <Box marginTop={2}>
        <Paper elevation={0} variant="outlined" className={classes.card}>
          <div className={classes.stack}>
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="Child Tax Credit / Other Dependents"
            />
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="Earned Income Credit"
            />
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="Education Credits (AOTC/LLC)"
            />
            <FormControlLabel
              control={<Checkbox color="primary" />}
              label="Retirement Savings Contributions Credit"
            />
          </div>
        </Paper>
      </Box>
    </Box>
  )
}

export default Credits
