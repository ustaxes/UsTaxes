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
import F1099Info from './income/F1099Info'
import Summary from './Summary'
import RealEstate from './income/RealEstate'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'

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
    contactInfo: '/contact'
  },
  refund: '/refundinfo',
  income: {
    w2s: '/income/w2jobinfo',
    f1099s: '/income/f1099s',
    realEstate: '/income/realestate'
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
          <StateLoader />
          <div className={classes.toolbar} />
          <Grid container spacing={2}>
            <Grid item sm />
            <Grid item sm={10} lg={6} >
            <PagerContext.Provider value={{ onAdvance: (onAdvance ?? (() => {})), navButtons }}>
              <Switch>
                <Redirect path="/" to={Urls.default} exact />
                {
                  allItems.map((item, index) =>
                    <Route key={index} exact path={item.url}>{item.element}</Route>
                  )
                }
                <Route>
                  <NoMatchPage/>
                </Route>
              </Switch>
            </PagerContext.Provider>
            </Grid>
            <Grid item sm />
          </Grid>
        </main>
        <div id='wave'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#00e676" fillOpacity="1" d="M0,160L12,160C24,160,48,160,72,149.3C96,139,120,117,144,101.3C168,85,192,75,216,80C240,85,264,107,288,112C312,117,336,107,360,90.7C384,75,408,53,432,80C456,107,480,181,504,186.7C528,192,552,128,576,112C600,96,624,128,648,170.7C672,213,696,267,720,288C744,309,768,299,792,272C816,245,840,203,864,186.7C888,171,912,181,936,186.7C960,192,984,192,1008,208C1032,224,1056,256,1080,245.3C1104,235,1128,181,1152,138.7C1176,96,1200,64,1224,74.7C1248,85,1272,139,1296,144C1320,149,1344,107,1368,101.3C1392,96,1416,128,1428,144L1440,160L1440,320L1428,320C1416,320,1392,320,1368,320C1344,320,1320,320,1296,320C1272,320,1248,320,1224,320C1200,320,1176,320,1152,320C1128,320,1104,320,1080,320C1056,320,1032,320,1008,320C984,320,960,320,936,320C912,320,888,320,864,320C840,320,816,320,792,320C768,320,744,320,720,320C696,320,672,320,648,320C624,320,600,320,576,320C552,320,528,320,504,320C480,320,456,320,432,320C408,320,384,320,360,320C336,320,312,320,288,320C264,320,240,320,216,320C192,320,168,320,144,320C120,320,96,320,72,320C48,320,24,320,12,320L0,320Z"></path></svg>
          <div id='wavefill'/>
        </div>
      </div>
    </ThemeProvider>
  )
}
