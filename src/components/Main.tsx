import React, { ReactElement } from 'react'
import { unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import {
  Switch,
  Route
} from 'react-router-dom'
import W2EmployerInfo from './W2EmployerInfo'
import W2EmployeeInfo from './W2EmployeeInfo'
import W2JobInfo from './W2JobInfo'
import RefundInfo from './RefundInfo'
import CreatePDF from './CreatePDF'
import ResponsiveDrawer, { Section } from './ResponsiveDrawer'
import TaxPayerInfo from './TaxPayer'

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

const Main = (): ReactElement => (
  <ThemeProvider theme={theme}>
    <ResponsiveDrawer sections={drawerSections} />
    <Switch>
      <Route path={Urls.taxpayer} exact>
        <TaxPayerInfo nextUrl={Urls.refund} />
      </Route>
      <Route path={Urls.refund} exact>
        <RefundInfo nextUrl={Urls.employer} />
      </Route>
      <Route path={Urls.employer} exact>
        <W2EmployerInfo nextUrl={Urls.employee} />
      </Route>
      <Route path={Urls.employee} exact>
        <W2EmployeeInfo nextUrl={Urls.job} />
      </Route>
      <Route path={Urls.job} exact>
        <W2JobInfo nextUrl={Urls.createPdf} />
      </Route>
      <Route path={Urls.createPdf} exact>
        <CreatePDF/>
      </Route>
    </Switch>
  </ThemeProvider>
)

export default Main
