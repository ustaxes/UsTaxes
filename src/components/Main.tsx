import React, { ReactElement } from 'react'
import { Box, unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import {
  Switch,
  Route
} from 'react-router-dom'
import W2EmployerInfo from './W2EmployerInfo'
import W2EmployeeInfo from './W2EmployeeInfo'
import W2JobInfo from './W2JobInfo'
import CreatePDF from './createPDF'
import ResponsiveDrawer, { Section } from './ResponsiveDrawer'
import { PagerButtons, usePager } from './pager'
import TaxPayerInfo from './TaxPayer'
import RefundInfo from './RefundInfo'

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

const Urls = {
  taxpayer: '/taxpayerinfo',
  refund: '/refundinfo',
  employer: '/w2employerinfo',
  employee: '/w2employeeinfo',
  job: '/w2jobinfo',
  createPdf: '/createpdf'
}

const drawerSections: Section[] = [
  {
    title: 'Personal',
    items: [
      ['Taxpayer Information', Urls.taxpayer],
      ['Refund Instructions', Urls.refund]
    ]
  },
  {
    title: 'Wages',
    items: [
      ['Employer Information', Urls.employer],
      ['Employee Information', Urls.employee],
      ['Job Information', Urls.job]
    ]
  },
  {
    title: 'Results',
    items: [
      ['Review and Print', Urls.createPdf]
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
        <Route path={Urls.taxpayer} exact>
          <TaxPayerInfo onAdvance={forward} navButtons={firstStepButtons} />
        </Route>
        <Route path={Urls.refund} exact>
          <RefundInfo onAdvance={forward} navButtons={stepDoneButtons} />
        </Route>
        <Route path="/w2employerinfo" exact>
          <W2EmployerInfo onAdvance={forward} navButtons={stepDoneButtons} />
        </Route>
        <Route path="/w2employeeinfo" exact>
          <W2EmployeeInfo onAdvance={forward} navButtons={stepDoneButtons} />
        </Route>
        <Route path="/w2jobinfo" exact>
          <W2JobInfo onAdvance={forward} navButtons={stepDoneButtons} />
        </Route>
        <Route path="/createpdf" exact>
          <CreatePDF navButtons={allDoneButtons} />
        </Route>
      </Switch>
    </ThemeProvider>
  )
}
