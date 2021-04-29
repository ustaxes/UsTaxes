import React, { ReactElement, ReactNode } from 'react'
import { Box, Button, unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import { red } from '@material-ui/core/colors'

interface FormContainerProps {
  onDone: () => void
  onCancel: () => void
  children: ReactNode
}

const theme = createMuiTheme({
  palette: {
    primary: red
  }
})

const FormContainer = ({ onDone, onCancel, children }: FormContainerProps): ReactElement => (
  <div>
    {children}
    <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
      <Box paddingRight={2}>
        <Button type="button" onClick={onDone} variant="contained" color="primary">
          Save
        </Button>
      </Box>
      <ThemeProvider theme={theme}>
        <Button type="button" onClick={onCancel} variant="contained" color="secondary">
          Close
        </Button>
      </ThemeProvider>
    </Box>
  </div>
)

export default FormContainer
