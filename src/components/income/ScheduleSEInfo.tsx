import { FormEvent, ReactElement } from 'react'
import { Helmet } from 'react-helmet-async'
import { Alert } from '@material-ui/lab'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Link } from 'react-router-dom'
import { Currency } from 'ustaxes/components/input'
import { usePager } from 'ustaxes/components/pager'
import Urls from 'ustaxes/data/urls'
import { TaxesState, useSelector } from 'ustaxes/redux'
import {
  estimateK1SelfEmploymentEarnings,
  estimateScheduleCNetProfit
} from 'ustaxes/core/selfEmployment'

export default function ScheduleSEInfo(): ReactElement {
  const info = useSelector((state: TaxesState) => state.information)
  const { navButtons, onAdvance } = usePager()

  const scheduleCNetProfit = estimateScheduleCNetProfit(info)
  const k1SelfEmploymentEarnings = estimateK1SelfEmploymentEarnings(info)
  const combinedAmount =
    (scheduleCNetProfit ?? 0) + (k1SelfEmploymentEarnings ?? 0)

  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    onAdvance()
  }

  return (
    <form tabIndex={-1} onSubmit={onSubmit}>
      <Helmet>
        <title>Schedule SE | Income | UsTaxes.org</title>
      </Helmet>
      <h2>Schedule SE (Self-Employment Tax)</h2>
      <Alert severity="info">
        Schedule SE is calculated automatically. There is no separate manual
        Schedule SE entry form in the interface.
      </Alert>
      <p>Use these pages to provide the inputs that feed Schedule SE:</p>
      <List dense>
        <ListItem>
          <ListItemText
            primary={
              <Link to={Urls.income.businesses}>
                Schedule C / Business income
              </Link>
            }
            secondary="Sole proprietorship gross receipts, expenses, and home office deduction"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              <Link to={Urls.income.partnershipIncome}>
                Partnership / K-1 income
              </Link>
            }
            secondary="Self-employment earnings from Schedule K-1 (Form 1065)"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={
              <Link to={Urls.deductions.selfEmployedHealthInsuranceWorksheet}>
                Form 7206 / Self-employed health insurance
              </Link>
            }
            secondary="Worksheet values used for the self-employed health insurance deduction"
          />
        </ListItem>
        <ListItem>
          <ListItemText
            primary={<Link to={Urls.createPdf}>Review and Print</Link>}
            secondary="See which IRS forms are included in the generated return"
          />
        </ListItem>
      </List>

      <h3>Current self-employment inputs</h3>
      <ul>
        <li>
          Schedule C net profit estimate:{' '}
          {scheduleCNetProfit !== undefined ? (
            <Currency value={scheduleCNetProfit} />
          ) : (
            'none entered yet'
          )}
        </li>
        <li>
          Partnership self-employment earnings:{' '}
          {k1SelfEmploymentEarnings !== undefined ? (
            <Currency value={k1SelfEmploymentEarnings} />
          ) : (
            'none entered yet'
          )}
        </li>
        <li>
          Combined self-employment amount:{' '}
          {combinedAmount !== 0 ? <Currency value={combinedAmount} /> : '0'}
        </li>
      </ul>

      <p>
        After you enter those inputs, UsTaxes computes Schedule SE while
        building your return. You will see it in{' '}
        <Link to={Urls.createPdf}>Review and Print</Link> when it is included.
      </p>
      {navButtons}
    </form>
  )
}
