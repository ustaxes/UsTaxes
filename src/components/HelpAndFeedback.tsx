import { Button, Grid, TextField } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { ReactElement, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { intentionallyFloat } from 'ustaxes/core/util'
import { USTState } from 'ustaxes/redux/store'
import anonymize from '../core/data/anonymize'

const HelpAndFeedback = (): ReactElement => {
  const state = useSelector((state: USTState) => state)
  const [anonymizedState, setAnonymizedState] = useState('')
  const [copied, doSetCopied] = useState(false)

  useEffect(() => {
    setAnonymizedState(JSON.stringify(anonymize(state), undefined, 2))
  }, [state])

  const setCopied = (): void => {
    doSetCopied(true)
    setTimeout(() => doSetCopied(false), 5000)
  }

  const copiedAlert = (() => {
    if (copied) {
      return (
        <Grid item>
          <Alert severity="info">Copied to clipboard</Alert>
        </Grid>
      )
    }
  })()

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(anonymizedState)
    setCopied()
  }

  return (
    <>
      <h2>Help and Feedback</h2>
      <p>Did you notice something wrong?</p>
      <p>
        Please email <strong>feedback@ustaxes.org</strong> with any questions or
        bugs. If your personal data might be helpful, please copy paste the
        below into the body of the email. Your data below should be properly
        anonymized.
      </p>
      <Grid container spacing={2} direction="column">
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            onClick={intentionallyFloat(copyToClipboard)}
          >
            Copy to clipboard
          </Button>
        </Grid>
        {copiedAlert}
        <Grid item>
          <TextField
            disabled
            multiline
            minRows={40}
            maxRows={100}
            fullWidth
            value={JSON.stringify(anonymize(state), null, 2)}
          />
        </Grid>
      </Grid>{' '}
    </>
  )
}

export default HelpAndFeedback
