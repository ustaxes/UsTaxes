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
import {
  Switch,
  Route,
  Redirect
} from 'react-router-dom'
import MenuIcon from '@material-ui/icons/Menu'
import W2JobInfo from './income/W2JobInfo'
import CreatePDF from './createPDF'
import ResponsiveDrawer, { item, Section, SectionItem } from './ResponsiveDrawer'
import { PagerButtons, PagerContext, usePager } from './pager'
import PrimaryTaxpayer from './TaxPayer'
import RefundBankAccount from './RefundBankAccount'
import SpouseAndDependent from './TaxPayer/SpouseAndDependent'
import ContactInfo from './TaxPayer/ContactInfo'
import FilingStatusSelect from './TaxPayer/FilingStatus'
import F1099Info from './income/F1099Info'
import Summary from './Summary'

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
    root: {
      display: 'flex'
    },
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
    content: {
      flexGrow: 1,
      padding: theme.spacing(3)
    }
  })
)

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
  credits: {
    main: '/credits',
    eic: '/credits/eic'
  },
  createPdf: '/createpdf',
  summary: '/summary',
  default: ''
}
Urls.default = Urls.taxPayer.info

const drawerSections: Section[] = [
  {
    title: 'Personal',
    items: [
      item('Primary Taxpayer', Urls.taxPayer.info, <PrimaryTaxpayer />),
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
      item('Summary', Urls.summary, <Summary />),
      item('Review and Print', Urls.createPdf, <CreatePDF />)
    ]
  }
]

export default function Main (): ReactElement {
  const allItems: SectionItem[] = drawerSections.flatMap((section: Section) => section.items)

  const [prev, onAdvance] = usePager(allItems, (item) => item.url)
  const [mobileOpen, setMobileOpen] = useState(false)

  const classes = useStyles()

  const navButtons: ReactElement = (
    <PagerButtons
      previousUrl={prev?.url}
      submitText={onAdvance !== undefined ? 'Save and Continue' : 'Create PDF'}
    />
  )

  const appBar = (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={classes.menuButton}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        {appBar}
        <ResponsiveDrawer sections={drawerSections} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        <main className={classes.content}>
          <div className={classes.toolbar} />
          <Grid container spacing={2}>
            <Grid item sm />
            <Grid item sm={10} >
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
            </Grid>
            <Grid item sm />
          </Grid>
        </main>
      </div>
    </ThemeProvider>
  )
}
