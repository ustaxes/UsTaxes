import React, { ReactElement, useState } from 'react'
import {
  unstable_createMuiStrictModeTheme as createMuiTheme,
  ThemeProvider,
  makeStyles,
  createStyles,
  Theme,
  AppBar,
  Toolbar,
  IconButton,
  Grid
} from '@material-ui/core'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import MenuIcon from '@material-ui/icons/Menu'
import W2JobInfo from './income/W2JobInfo'
import CreatePDF from './createPDF'
import ResponsiveDrawer, {
  item,
  Section,
  SectionItem
} from './ResponsiveDrawer'
import { PagerButtons, PagerContext, usePager } from './pager'
import PrimaryTaxpayer from './TaxPayer'
import RefundBankAccount from './RefundBankAccount'
import SpouseAndDependent from './TaxPayer/SpouseAndDependent'
import ContactInfo from './TaxPayer/ContactInfo'
import F1099Info from './income/F1099Info'
import Summary from './Summary'
import RealEstate from './income/RealEstate'
import GettingStarted from './GettingStarted'
import F1098eInfo from './deductions/F1098eInfo'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'
import Questions from './Questions'
import { useViewport } from '../hooks/Viewport'
import { useEffect } from 'react'

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

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    appBar: {
      width: '100%',
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    },
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    },
    main: {
      display: 'flex'
    },
    content: {
      padding: theme.spacing(3)
    }
  })
)

const Urls = {
  usTaxes: {
    start: '/start'
  },
  taxPayer: {
    root: '/taxpayer',
    info: '/info',
    spouseAndDependent: '/spouseanddependent',
    contactInfo: '/contact'
  },
  refund: '/refundinfo',
  questions: '/questions',
  income: {
    w2s: '/income/w2jobinfo',
    f1099s: '/income/f1099s',
    realEstate: '/income/realestate'
  },
  deductions: {
    f1098es: '/deductions/studentloaninterest'
  },
  credits: {
    main: '/credits',
    eic: '/credits/eic'
  },
  createPdf: '/createpdf',
  summary: '/summary',
  default: ''
}
Urls.default = Urls.usTaxes.start

const drawerSections: Section[] = [
  {
    title: 'UsTaxes.org',
    items: [item('Getting Started', Urls.usTaxes.start, <GettingStarted />)]
  },
  {
    title: 'Personal',
    items: [
      item('Primary Taxpayer', Urls.taxPayer.info, <PrimaryTaxpayer />),
      item(
        'Spouse and Dependents',
        Urls.taxPayer.spouseAndDependent,
        <SpouseAndDependent />
      ),
      item('Contact Information', Urls.taxPayer.contactInfo, <ContactInfo />)
    ]
  },
  {
    title: 'Income',
    items: [
      item('Wages (W2)', Urls.income.w2s, <W2JobInfo />),
      item('Income (1099)', Urls.income.f1099s, <F1099Info />),
      item('Real Estate', Urls.income.realEstate, <RealEstate />)
    ]
  },
  {
    title: 'Deductions',
    items: [
      item('Student Loan Interest', Urls.deductions.f1098es, <F1098eInfo />)
    ]
  },
  {
    title: 'Results',
    items: [
      item('Refund Information', Urls.refund, <RefundBankAccount />),
      item('Informational Questions', Urls.questions, <Questions />),
      item('Summary', Urls.summary, <Summary />),
      item('Review and Print', Urls.createPdf, <CreatePDF />)
    ]
  }
]

export default function Main(): ReactElement {
  const classes = useStyles()
  const { width } = useViewport()
  const [isMobile, setIsMobile] = useState(theme.breakpoints.values.sm > width)

  const allItems: SectionItem[] = drawerSections.flatMap(
    (section: Section) => section.items
  )
  const [prev, onAdvance] = usePager(allItems, (item) => item.url)

  const navButtons: ReactElement = (
    <PagerButtons
      previousUrl={prev?.url}
      submitText={onAdvance !== undefined ? 'Save and Continue' : 'Create PDF'}
    />
  )

  useEffect(() => {
    setIsMobile(theme.breakpoints.values.sm > width)
  }, [width])

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.toolbar} />
      <main className={classes.main}>
        <StateLoader />
        <PagerContext.Provider
          value={{ onAdvance: onAdvance ?? (() => {}), navButtons }}
        >
          <Switch>
            <Redirect path="/" to={Urls.default} exact />
            {allItems.map((item, index) => (
              <Route key={index} exact path={item.url}>
                {useLocation().pathname !== '/start' && (
                  <>
                    <AppBar position="fixed" className={classes.appBar}>
                      <Toolbar>
                        <IconButton
                          color="inherit"
                          aria-label="open drawer"
                          edge="start"
                          onClick={() => setIsMobile((isMobile) => !isMobile)}
                          className={classes.menuButton}
                        >
                          <MenuIcon />
                        </IconButton>
                      </Toolbar>
                    </AppBar>
                    <ResponsiveDrawer
                      sections={drawerSections}
                      isOpen={!isMobile}
                      onClose={() => setIsMobile((isMobile) => !isMobile)}
                    />
                  </>
                )}
                <Grid
                  className={classes.content}
                  container
                  justifyContent="center"
                  direction="row"
                >
                  <Grid item xs={12} lg={6}>
                    {item.element}
                  </Grid>
                </Grid>
              </Route>
            ))}
            <Route>
              <NoMatchPage />
            </Route>
          </Switch>
        </PagerContext.Provider>
      </main>
    </ThemeProvider>
  )
}
