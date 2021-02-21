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
      <div id='wave'>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#00e676" fillOpacity="1" d="M0,160L12,160C24,160,48,160,72,149.3C96,139,120,117,144,101.3C168,85,192,75,216,80C240,85,264,107,288,112C312,117,336,107,360,90.7C384,75,408,53,432,80C456,107,480,181,504,186.7C528,192,552,128,576,112C600,96,624,128,648,170.7C672,213,696,267,720,288C744,309,768,299,792,272C816,245,840,203,864,186.7C888,171,912,181,936,186.7C960,192,984,192,1008,208C1032,224,1056,256,1080,245.3C1104,235,1128,181,1152,138.7C1176,96,1200,64,1224,74.7C1248,85,1272,139,1296,144C1320,149,1344,107,1368,101.3C1392,96,1416,128,1428,144L1440,160L1440,320L1428,320C1416,320,1392,320,1368,320C1344,320,1320,320,1296,320C1272,320,1248,320,1224,320C1200,320,1176,320,1152,320C1128,320,1104,320,1080,320C1056,320,1032,320,1008,320C984,320,960,320,936,320C912,320,888,320,864,320C840,320,816,320,792,320C768,320,744,320,720,320C696,320,672,320,648,320C624,320,600,320,576,320C552,320,528,320,504,320C480,320,456,320,432,320C408,320,384,320,360,320C336,320,312,320,288,320C264,320,240,320,216,320C192,320,168,320,144,320C120,320,96,320,72,320C48,320,24,320,12,320L0,320Z"></path></svg>
        <div id='wavefill'/>
      </div>
     </ThemeProvider>
  )
}
