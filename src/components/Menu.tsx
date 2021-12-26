import { ReactElement, useState } from 'react'
import { useLocation } from 'react-router-dom'

import {
  createStyles,
  makeStyles,
  AppBar,
  IconButton,
  Slide,
  Theme,
  Toolbar,
  Typography
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import MenuIcon from '@material-ui/icons/Menu'
import ResponsiveDrawer, { item, Section } from './ResponsiveDrawer'

import W2JobInfo from './income/W2JobInfo'
import CreatePDF from './CreatePDF'
import PrimaryTaxpayer from './TaxPayer'
import RefundBankAccount from './RefundBankAccount'
import SpouseAndDependent from './TaxPayer/SpouseAndDependent'
import F1099Info from './income/F1099Info'
import EstimatedTaxes from './payments/EstimatedTaxes'
import RealEstate from './income/RealEstate'
import GettingStarted from './GettingStarted'
import F1098eInfo from './deductions/F1098eInfo'
import Questions from './Questions'
import Urls from 'ustaxes/data/urls'

import { isMobile } from 'react-device-detect'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      zIndex: theme.zIndex.drawer + 1,
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    },
    toolbar: {
      alignItems: 'center'
    },
    title: {
      position: 'absolute',
      width: '100%',
      textAlign: 'center',
      pointerEvents: 'none'
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    },
    gutters: {
      margin: '0 12px',
      padding: 0
    }
  })
)

const getTitleAndPage = (sections: Section[], currentUrl: string): string => {
  const page = sections
    .flatMap(({ title: sectionTitle, items }) =>
      items.map(({ title, url }) => ({ sectionTitle, title, url }))
    )
    .find(({ url }) => url === currentUrl)

  return `${page?.sectionTitle} - ${page?.title}`
}

export const drawerSections: Section[] = [
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
      )
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
    title: 'Payments',
    items: [
      item('Estimated Taxes', Urls.payments.estimatedTaxes, <EstimatedTaxes />)
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
      item('Review and Print', Urls.createPdf, <CreatePDF />)
    ]
  }
]

const Menu = (): ReactElement => {
  const classes = useStyles()
  const [isOpen, setOpen] = useState(!isMobile)

  return (
    <>
      <AppBar position="fixed" className={classes.root}>
        <Toolbar
          className={classes.toolbar}
          classes={{ gutters: classes.gutters }}
        >
          <IconButton
            color="inherit"
            aria-label={`${isOpen ? 'close' : 'open'} drawer`}
            edge="start"
            onClick={() => setOpen((isOpen) => !isOpen)}
            className={classes.menuButton}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Slide in={isOpen} direction={'right'}>
            <Typography className={classes.title}>Menu</Typography>
          </Slide>
          <Slide in={!isOpen} direction={'left'}>
            <Typography className={classes.title}>
              {getTitleAndPage(drawerSections, useLocation().pathname)}
            </Typography>
          </Slide>
        </Toolbar>
      </AppBar>
      <ResponsiveDrawer
        sections={drawerSections}
        isOpen={isOpen}
        setOpen={setOpen}
      />
    </>
  )
}

export default Menu
