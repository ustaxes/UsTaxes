import React, { ReactElement, ReactNode } from 'react'
import { Box, Button } from '@material-ui/core'

interface FormContainerProps {
  onDone: () => void
  onCancel: () => void
  children: ReactNode
}

const FormContainer = ({ onDone, onCancel, children }: FormContainerProps): ReactElement => (
  <div>
    {children}
    <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
      <Box paddingRight={2}>
        <Button type="button" onClick={onDone} variant="contained" color="secondary">
          Add
        </Button>
      </Box>
      <Button type="button" onClick={onCancel} variant="contained" color="secondary">
        Close
      </Button>
    </Box>
  </div>
)

export default FormContainer
