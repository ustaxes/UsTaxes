import { ReactElement } from 'react'
import {
  Avatar,
  Grid,
  List,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@material-ui/core'
import { YearsTaxesState } from 'ustaxes/redux'
import { Information } from 'ustaxes/core/data'
import { Check, Close, ExpandMore } from '@material-ui/icons'
import Alert from '@material-ui/lab/Alert'
import { run } from 'ustaxes/core/util'
import yearFormBuilder from 'ustaxes/forms/YearForms'
import { TaxYear } from 'ustaxes/data'
import { useSelector } from 'react-redux'
import { createSummary, SummaryData } from './SummaryData'
import { Currency } from './input'
import { displayRound } from 'ustaxes/core/irsForms/util'

interface BinaryStateListItemProps {
  active: boolean
  children: string | ReactElement | ReactElement[]
}

const BinaryStateListItem = ({
  active,
  children
}: BinaryStateListItemProps): ReactElement => {
  return (
    <Grid container spacing={3}>
      <Grid item style={{ margin: 'auto' }}>
        <Avatar>
          {active ? (
            <Check titleAccess="Eligible" />
          ) : (
            <Close titleAccess="Ineligible" />
          )}
        </Avatar>
      </Grid>
      <Grid item xs zeroMinWidth>
        {children}
      </Grid>
    </Grid>
  )
}

interface F1040SummaryProps {
  summary: SummaryData
}

const F1040Summary = ({ summary }: F1040SummaryProps): ReactElement => (
  <>
    {(() => {
      if (summary.amountOwed !== undefined && summary.amountOwed > 0) {
        return (
          <div>
            <Typography variant="body2" color="textSecondary">
              Amount Owed: <Currency value={-summary.amountOwed} />
            </Typography>
          </div>
        )
      }
      if (summary.refundAmount !== undefined && summary.refundAmount > 0) {
        return (
          <div>
            <Typography variant="body2" color="textSecondary">
              Refund Amount: <Currency value={summary.refundAmount} />
            </Typography>
          </div>
        )
      }
    })()}

    <h3>Credits</h3>
    <Grid container>
      <Grid item zeroMinWidth>
        <List>
          {summary.credits.map((credit) => (
            <BinaryStateListItem key={credit.name} active={credit.allowed}>
              <Typography variant="body2" color="textPrimary">
                {credit.name}
              </Typography>
              {(() => {
                if (credit.value !== undefined) {
                  return (
                    <Typography variant="body2" color="textSecondary">
                      Credit: <Currency value={credit.value} />
                    </Typography>
                  )
                }
                return <></>
              })()}
            </BinaryStateListItem>
          ))}
        </List>
      </Grid>
    </Grid>

    {(() => {
      if (summary.worksheets.length > 0) {
        return (
          <Grid container>
            <Grid item zeroMinWidth>
              <h3>Worksheets</h3>
              <List>
                {summary.worksheets.map((worksheet, idx) => (
                  <Accordion key={idx}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      {worksheet.name}
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer>
                        <Table size="small">
                          <TableBody>
                            {worksheet.lines.map((line) => (
                              <TableRow key={line.line}>
                                <TableCell component="th">
                                  Line {line.line}
                                </TableCell>
                                <TableCell>
                                  {typeof line.value === 'number' ? (
                                    <Currency
                                      value={displayRound(line.value) ?? 0}
                                    />
                                  ) : (
                                    line.value
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            </Grid>
          </Grid>
        )
      }
      return <></>
    })()}
  </>
)

const Summary = (): ReactElement => {
  const year: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )
  const info: Information = useSelector(
    (state: YearsTaxesState) => state[state.activeYear]
  )
  const assets = useSelector((state: YearsTaxesState) => state.assets)

  const builder = yearFormBuilder(year, info, assets)

  const summaryBody = (() => {
    if (info.taxPayer.primaryPerson === undefined) {
      return <p>No data entered yet</p>
    } else {
      const f1040Result = builder.f1040()

      return (
        <>
          <h3>Federal</h3>
          {run(f1040Result).fold(
            (errors) => (
              <>
                {errors.map((error, i) => (
                  <Alert key={i} severity="warning">
                    {error}
                  </Alert>
                ))}
              </>
            ),
            (forms) => {
              const summary = createSummary(year, forms)
              if (summary === undefined) {
                return undefined
              }
              return <F1040Summary summary={summary} />
            }
          )}
        </>
      )
    }
  })()

  return (
    <div>
      <h2>Summary</h2>
      {summaryBody}
    </div>
  )
}

export default Summary
