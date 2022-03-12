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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import ResponsiveDrawer, {
  item,
  Section,
  SectionItem
} from './ResponsiveDrawer'

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
import ItemizedDeductions from './deductions/ItemizedDeductions'
import Questions from './Questions'
import UserSettings from './UserSettings'
import Urls from 'ustaxes/data/urls'

import { isMobileOnly as isMobile } from 'react-device-detect'
import HealthSavingsAccounts from './savingsAccounts/healthSavingsAccounts'
import IRA from './savingsAccounts/IRA'
import OtherInvestments from './income/OtherInvestments'
import { StockOptions } from './income/StockOptions'
import { PartnershipIncome } from './income/PartnershipIncome'

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

const getTitleAndPage = (currentUrl: string): string => {
  const backPage = backPages.find(({ url }) => url === currentUrl)
  if (backPage) return backPage.title

  const page = drawerSections
    .flatMap(({ title: sectionTitle, items }) =>
      items.map(({ title, url }) => ({ sectionTitle, title, url }))
    )
    .find(({ url }) => url === currentUrl)

  return `${page?.sectionTitle} - ${page?.title}`
}

export const backPages: SectionItem[] = [
  {
    title: 'User Settings',
    url: Urls.settings,
    element: <UserSettings />
  }
]

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
      item('Rental income', Urls.income.realEstate, <RealEstate />),
      item(
        'Other investments',
        Urls.income.otherInvestments,
        <OtherInvestments />
      ),
      item('Stock options', Urls.income.stockOptions, <StockOptions />),
      item(
        'Partnership Income',
        Urls.income.partnershipIncome,
        <PartnershipIncome />
      )
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
      item('Student Loan Interest', Urls.deductions.f1098es, <F1098eInfo />),
      item(
        'Itemized Deductions',
        Urls.deductions.itemized,
        <ItemizedDeductions />
      )
    ]
  },
  {
    title: 'Savings Accounts',
    items: [
      item(
        'Health Savings Account (HSA)',
        Urls.savingsAccounts.healthSavingsAccounts,
        <HealthSavingsAccounts />
      ),
      item(
        'Individual Retirement Arrangements (IRA)',
        Urls.savingsAccounts.ira,
        <IRA />
      )
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

  return <>
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
          size="large">
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <Slide in={isOpen} direction={'right'}>
          <Typography className={classes.title}>Menu</Typography>
        </Slide>
        <Slide in={!isOpen} direction={'left'}>
          <Typography className={classes.title}>
            {getTitleAndPage(useLocation().pathname)}
          </Typography>
        </Slide>
      </Toolbar>
    </AppBar>
    <ResponsiveDrawer
      sections={drawerSections}
      isOpen={isOpen}
      setOpen={setOpen}
    />
  </>;
}

export default Menu
