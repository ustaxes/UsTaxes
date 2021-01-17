import React from 'react'
import { Box, unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import {
  Switch,
  Route
} from 'react-router-dom'
import W2EmployerInfo from './w2EmployerInfo'
import W2EmployeeInfo from './w2EmployeeInfo'
import W2JobInfo from './w2JobInfo'
import FamilyInfo from './familyInfo'
import CreatePDF from './createPDF'
import ResponsiveDrawer from './menu'

const theme = createMuiTheme({
  palette: {
    secondary: {
      light: '#4f5b62',
      main: '#263238',
      dark: '#000a12',
      contrastText: '#ffffff'
    },
    primary: {
      light: '#66ffa6',
      main: '#00e676',
      dark: '#00b248',
      contrastText: '#000000'
    }
  }
})

const drawerSections = [
  {
    title: 'Wages',
    items: [
      ['Employer Information', '/w2employerinfo'],
      ['Employee Information', '/w2employeeinfo'],
      ['Job Information', '/w2jobinfo']
    ]
  },
  {
    title: 'Personal',
    items: [
      ['Family Information', '/familyinfo'],
      ['Review and Print', '/createpdf']
    ]
  }
]

export default function W2 () {
  return (
    <ThemeProvider theme={theme}>
      <ResponsiveDrawer sections={drawerSections} />
      <Box display="flex" justifyContent="center">
        <Box display="flex" justifyContent="flex-start">
          <h1>Wages (Form W-2)</h1>
        </Box>
      </Box>
      <Switch>
        <Route path="/w2employerinfo" exact>
          <W2EmployerInfo nextUrl="/w2employeeinfo" />
        </Route>
        <Route path="/w2employeeinfo" exact>
          <W2EmployeeInfo nextUrl="/w2jobinfo" />
        </Route>
        <Route path="/w2jobinfo" exact>
          <W2JobInfo nextUrl="/familyinfo" />
        </Route>
        <Route path="/familyinfo" exact>
          <FamilyInfo nextUrl="/createpdf" />
        </Route>
        <Route path="/createpdf" exact>
          <CreatePDF/>
        </Route>
      </Switch>
    </ThemeProvider>
  )
}
