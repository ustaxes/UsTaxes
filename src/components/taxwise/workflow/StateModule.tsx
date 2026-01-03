import { ReactElement } from 'react'
import { Box, Chip, Paper, Typography, makeStyles } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2)
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1)
  }
}))

const StateModule = (): ReactElement => {
  const classes = useStyles()

  return (
    <Box>
      <div className={classes.header}>
        <Typography variant="h5">State Return</Typography>
        <Chip size="small" label="Ohio Stub" />
      </div>
      <Typography variant="body2" color="textSecondary">
        State modules plug into the federal packet and surface state-specific
        diagnostics.
      </Typography>
      <Box marginTop={2}>
        <Paper elevation={0} variant="outlined" className={classes.card}>
          <Typography variant="subtitle2">Ohio (OH)</Typography>
          <Typography variant="body2" color="textSecondary">
            Placeholder module ready for 2025 updates. Connect residency,
            adjustments, and local credits when the state rules are finalized.
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}

export default StateModule
