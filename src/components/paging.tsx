import React, { ReactElement } from 'react'
import { useHistory } from 'react-router-dom'
import { Box, Button } from '@material-ui/core'

export const Back = (): ReactElement => {
  const history = useHistory()

  const onClick = (): void => {
    if (history.length <= 1) {
      history.push('/')
    } else {
      history.goBack()
    }
  }

  return (
    <Button onClick={onClick} variant="contained" color="secondary" >
      Back
    </Button>
  )
}

const finishPageWith = (finishButtonText: string): ReactElement => (
  <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
    <Box display="flex" justifyContent="flex-start" paddingRight={2}>
      <Back />
    </Box>

    <Button type="submit" variant="contained" color="primary">
      {finishButtonText}
    </Button>
  </Box>
)

export const FinishPage = (): ReactElement =>
  finishPageWith('Save and Continue')

export const FinishAll = (): ReactElement =>
  finishPageWith('Create PDF')
