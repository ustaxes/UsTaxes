import React, { ReactElement } from 'react'
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
import ResponsiveDrawer, { Section } from './menu'
import { PagerButtons, usePager } from './pager'

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

const drawerSections: Section[] = [
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
      ['Family Information', '/familyinfo']
    ]
  },
  {
    title: 'Results',
    items: [
      ['Review and Print', '/createpdf']
    ]
  }
]

const allUrls: string[] = (
  drawerSections
    .flatMap((section: Section) => section.items)
    .map((item) => item[1])
)

export default function Main (): ReactElement {
  const [, forward, prevUrl] = usePager(allUrls)

  const firstStepButtons: ReactElement = <PagerButtons previousUrl={prevUrl} submitText="Save and Continue" />
  const stepDoneButtons: ReactElement = <PagerButtons previousUrl={prevUrl} submitText="Save and Continue" />
  const allDoneButtons: ReactElement = <PagerButtons previousUrl={prevUrl} submitText="Create PDF" />

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
          <W2EmployerInfo onAdvance={forward}>{firstStepButtons}</W2EmployerInfo>
        </Route>
        <Route path="/w2employeeinfo" exact>
          <W2EmployeeInfo onAdvance={forward}>{stepDoneButtons}</W2EmployeeInfo>
        </Route>
        <Route path="/w2jobinfo" exact>
          <W2JobInfo onAdvance={forward}>{stepDoneButtons}</W2JobInfo>
        </Route>
        <Route path="/familyinfo" exact>
          <FamilyInfo onAdvance={forward}>{stepDoneButtons}</FamilyInfo>
        </Route>
        <Route path="/createpdf" exact>
          <CreatePDF>{allDoneButtons}</CreatePDF>
        </Route>
      </Switch>
    </ThemeProvider>
  )
}
