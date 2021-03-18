import React, { ReactElement } from 'react'
import { unstable_createMuiStrictModeTheme as createMuiTheme, ThemeProvider } from '@material-ui/core'
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import W2JobInfo from './income/W2JobInfo'
import CreatePDF from './createPDF'
import ResponsiveDrawer, { item, Section, SectionItem } from './ResponsiveDrawer'
import { PagerButtons, PagerContext, usePager } from './pager'
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
  createPdf: '/createpdf',
  default: ''
}
Urls.default = Urls.taxPayer.info

const drawerSections: Section[] = [
  {
    title: 'Personal',
    items: [
      item('Taxpayer Information', Urls.taxPayer.info, <TaxPayerInfo />),
      item('Spouse and Dependents', Urls.taxPayer.spouseAndDependent, <SpouseAndDependent />),
      item('Filing Status', Urls.taxPayer.filingStatus, <FilingStatusSelect />),
      item('Contact Information', Urls.taxPayer.contactInfo, <ContactInfo />)
    ]
  },
  {
    title: 'Income',
    items: [
      item('Wages (W2)', Urls.income.w2s, <W2JobInfo />),
      item('Income (1099)', Urls.income.f1099s, <F1099Info />)
    ]
  },
  {
    title: 'Results',
    items: [
      item('Refund Information', Urls.refund, <RefundBankAccount />),
      item('Review and Print', Urls.createPdf, <CreatePDF />)
    ]
  }
]

export default function Main (): ReactElement {
  const allItems: SectionItem[] = drawerSections.flatMap((section: Section) => section.items)

  const [prev, onAdvance] = usePager(allItems, (item) => item.url)

  const navButtons: ReactElement = (
    <PagerButtons
      previousUrl={prev?.url}
      submitText={onAdvance !== undefined ? 'Save and Continue' : 'Create PDF'}
    />
  )

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveDrawer sections={drawerSections} />
      <Switch>
        <Redirect path="/" to={Urls.default} exact />
        <PagerContext.Provider value={{ onAdvance: (onAdvance ?? (() => {})), navButtons }}>
        {
          allItems.map((item, index) =>
            <Route key={index} path={item.url}>{item.element}</Route>
          )
        }
        </PagerContext.Provider>
      </Switch>
    </ThemeProvider>
  )
}
