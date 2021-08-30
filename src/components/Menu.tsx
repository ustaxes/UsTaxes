import { useEffect, useState } from 'react'
import {
  createStyles,
  makeStyles,
  AppBar,
  IconButton,
  Theme,
  Toolbar
} from '@material-ui/core'
import MenuIcon from '@material-ui/icons/Menu'

import ResponsiveDrawer, { item, Section } from './ResponsiveDrawer'

import W2JobInfo from './income/W2JobInfo'
import CreatePDF from './createPDF'
import PrimaryTaxpayer from './TaxPayer'
import RefundBankAccount from './RefundBankAccount'
import SpouseAndDependent from './TaxPayer/SpouseAndDependent'
import ContactInfo from './TaxPayer/ContactInfo'
import F1099Info from './income/F1099Info'
import Summary from './Summary'
import RealEstate from './income/RealEstate'
import GettingStarted from './GettingStarted'
import F1098eInfo from './deductions/F1098eInfo'
import Questions from './Questions'
import Urls from 'ustaxes/data/urls'
import { useDevice } from 'ustaxes/hooks/Device'
import { ReactElement } from 'react'

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
    }
  })
)

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

const Menu = (): ReactElement => {
  const classes = useStyles()
  const { isMobile } = useDevice()
  const [isOpen, setOpen] = useState(!isMobile)

  useEffect(() => {
    if (!isMobile) {
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [isMobile])

  return (
    <>
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => setOpen((isOpen) => !isOpen)}
            className={classes.menuButton}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <ResponsiveDrawer
        sections={drawerSections}
        isOpen={isOpen}
        onClose={() => setOpen(false)}
      />
    </>
  )
}

export default Menu
