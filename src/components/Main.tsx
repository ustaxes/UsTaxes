import React, { ReactElement } from 'react'
import { unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import {
  Switch,
  Route
} from 'react-router-dom'
import W2JobInfo from './W2JobInfo'
import CreatePDF from './createPDF'
import ResponsiveDrawer, { Section } from './ResponsiveDrawer'
import { PagerButtons, usePager } from './pager'
import TaxPayerInfo from './TaxPayer'
import RefundBankAccount from './RefundBankAccount'

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
      ['Refund Information', Urls.refund]
    ]
  },
  {
    title: 'Income',
    items: [
      ['Wages (W2)', Urls.job]
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
      <Switch>
        <Route path={Urls.taxpayer} exact>
          <TaxPayerInfo onAdvance={forward} navButtons={firstStepButtons} />
        </Route>
        <Route path={Urls.refund} exact>
          <RefundBankAccount onAdvance={forward} navButtons={stepDoneButtons} />
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
