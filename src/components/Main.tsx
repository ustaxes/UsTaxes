import React, { ReactElement } from 'react'
import { unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import W2JobInfo from './income/W2JobInfo'
import CreatePDF from './createPDF'
import ResponsiveDrawer, { Section } from './ResponsiveDrawer'
import { PagerButtons, usePager } from './pager'
import TaxPayerInfo from './TaxPayer'
import RefundBankAccount from './RefundBankAccount'
import SpouseAndDependent from './TaxPayer/SpouseAndDependent'
import ContactInfo from './TaxPayer/ContactInfo'
import FilingStatusSelect from './TaxPayer/FilingStatus'
import F1099Info from './income/F1099Info'

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
  taxPayer: {
    root: '/taxpayer',
    info: '/info',
    spouseAndDependent: '/spouseanddependent',
    filingStatus: '/filingstatus',
    contactInfo: '/contact'
  },
  refund: '/refundinfo',
  income: {
    w2s: '/income/w2jobinfo',
    f1099s: '/income/f1099s'
  },
  createPdf: '/createpdf'
}

const drawerSections: Section[] = [
  {
    title: 'Personal',
    items: [
      ['Taxpayer Information', Urls.taxPayer.info],
      ['Spouse and Dependents', Urls.taxPayer.spouseAndDependent],
      ['Filing Status', Urls.taxPayer.filingStatus],
      ['Contact Information', Urls.taxPayer.contactInfo]
    ]
  },
  {
    title: 'Income',
    items: [
      ['Wages (W2)', Urls.income.w2s],
      ['Income (1099)', Urls.income.f1099s]
    ]
  },
  {
    title: 'Results',
    items: [
      ['Refund Information', Urls.refund],
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
        <Redirect path="/" to={Urls.taxPayer.info} exact />
        <Route path={Urls.taxPayer.info}>
          <TaxPayerInfo onAdvance={forward} navButtons={firstStepButtons} />
        </Route>
        <Route path={Urls.taxPayer.spouseAndDependent}>
          <SpouseAndDependent onAdvance={forward} navButtons={firstStepButtons} />
        </Route>
        <Route path={Urls.taxPayer.contactInfo}>
          <ContactInfo onAdvance={forward} navButtons={firstStepButtons}/>
        </Route>
        <Route path={Urls.taxPayer.filingStatus}>
          <FilingStatusSelect onAdvance={forward} navButtons={firstStepButtons}/>
        </Route>
        <Route path={Urls.refund} exact>
          <RefundBankAccount onAdvance={forward} navButtons={stepDoneButtons} />
        </Route>
        <Route path={Urls.income.w2s} exact>
          <W2JobInfo onAdvance={forward} navButtons={stepDoneButtons} />
        </Route>
        <Route path={Urls.income.f1099s} exact>
          <F1099Info onAdvance={forward} navButtons={stepDoneButtons} />
        </Route>
        <Route path="/createpdf" exact>
          <CreatePDF navButtons={allDoneButtons} />
        </Route>
      </Switch>
    </ThemeProvider>
  )
}
