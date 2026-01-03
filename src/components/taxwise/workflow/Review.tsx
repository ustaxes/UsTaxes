import { ReactElement, useMemo, useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Snackbar,
  Typography,
  makeStyles
} from '@material-ui/core'
import Alert from '@material-ui/lab/Alert'
import { useSelector } from 'react-redux'
import { Information, TaxYears } from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'
import { Currency } from 'ustaxes/components/input'
import { getModule } from 'ustaxes/core/stateModules/StateRegistry'
import { buildReturnPacket } from 'ustaxes/core/returnPacket/adapters'
import { TaxReturnPacket } from 'ustaxes/core/returnPacket/types'
import { generateClientPacketPdf } from 'ustaxes/pdf/ClientPacketPdf'
import { ComputedSummary, PdfDiagnostic } from 'ustaxes/pdf/pdfTypes'
import { downloadBlob, openBlobInNewTab } from 'ustaxes/pdf/downloadPdf'
import { computeFederalReturn } from 'ustaxes/core/engine/federal/computeFederalReturn'

const useStyles = makeStyles((theme) => ({
  card: {
    padding: theme.spacing(2)
  },
  metric: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5)
  },
  metricValue: {
    fontWeight: 600
  },
  checklist: {
    display: 'grid',
    gap: theme.spacing(1)
  },
  chip: {
    backgroundColor: '#e6edf5',
    color: '#1b3a57'
  }
}))

const Review = (): ReactElement => {
  const classes = useStyles()
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const info: Information = useSelector(
    (state: YearsTaxesState) => state[state.activeYear]
  )
  const activeReturnId = useSelector(
    (state: YearsTaxesState) => state.activeReturnId
  )
  const returns = useSelector((state: YearsTaxesState) => state.returns)
  const auditLog = useSelector((state: YearsTaxesState) => state.auditLog)

  const activeReturn = useMemo(
    () => returns.find((item) => item.id === activeReturnId),
    [activeReturnId, returns]
  )
  const packet = useMemo<TaxReturnPacket | null>(() => {
    if (!activeReturn) {
      return null
    }
    return buildReturnPacket(info, activeReturn, auditLog)
  }, [activeReturn, auditLog, info])

  const computedReturn = useMemo(
    () => (packet ? computeFederalReturn(packet) : null),
    [packet]
  )

  const stateDiagnostics = useMemo(() => {
    if (!packet || !activeReturn) {
      return []
    }
    const module = getModule(activeReturn.state)
    if (!module) {
      return []
    }
    return module.compute(packet).diagnostics
  }, [activeReturn, packet])

  const federalDiagnostics = computedReturn?.diagnostics ?? []
  const errorDiagnostics = federalDiagnostics.filter(
    (diagnostic) => diagnostic.level === 'error'
  )
  const warningDiagnostics = federalDiagnostics.filter(
    (diagnostic) => diagnostic.level === 'warning'
  )

  const computedSummary = useMemo<ComputedSummary | null>(() => {
    if (!activeReturn) {
      return null
    }
    if (!computedReturn) {
      return null
    }
    const mapDiagnostics = (items: { level: string; message: string }[]) =>
      items.map(
        (item): PdfDiagnostic => ({
          level: item.level as PdfDiagnostic['level'],
          message: item.message
        })
      )

    const taxpayerName = packet?.taxpayer
      ? `${packet.taxpayer.firstName ?? ''} ${
          packet.taxpayer.lastName ?? ''
        }`.trim()
      : 'Taxpayer'
    const spouseName = packet?.spouse
      ? `${packet.spouse.firstName ?? ''} ${
          packet.spouse.lastName ?? ''
        }`.trim()
      : ''
    const displayName = spouseName
      ? `${taxpayerName} & ${spouseName}`.trim()
      : taxpayerName

    return {
      taxpayerDisplayName: displayName || 'Taxpayer',
      taxYear: `${TaxYears[activeReturn.taxYear]}`,
      state: activeReturn.state,
      filingStatus: info.taxPayer.filingStatus,
      status: activeReturn.status,
      preparedAt: new Date(activeReturn.updatedAt).toLocaleString(),
      totals: {
        refundAmount: computedReturn.refundAmount,
        amountOwed: computedReturn.amountOwed,
        adjustedGrossIncome: computedReturn.adjustedGrossIncome,
        taxableIncome: computedReturn.taxableIncome,
        totalTax: computedReturn.federalTax,
        payments: computedReturn.payments,
        credits: computedReturn.credits
      },
      scheduleC:
        packet?.scheduleC.map((item) => ({
          businessName: item.businessName,
          grossReceipts: item.grossReceipts,
          expenses: item.expenses,
          netProfit: item.grossReceipts - item.expenses
        })) ?? [],
      diagnostics: {
        federal: mapDiagnostics(federalDiagnostics),
        state: mapDiagnostics(stateDiagnostics)
      }
    }
  }, [
    activeReturn,
    computedReturn,
    federalDiagnostics,
    info.taxPayer.filingStatus,
    packet,
    stateDiagnostics
  ])

  const generatePdfBlob = async (): Promise<Blob | null> => {
    if (!packet || !computedSummary) {
      setPdfError('Create a return before generating the PDF packet.')
      return null
    }
    setIsGeneratingPdf(true)
    setPdfError(null)
    try {
      return await generateClientPacketPdf(packet, computedSummary, {
        includeDiagnostics: true,
        format: 'client'
      })
    } catch (error) {
      setPdfError('Unable to generate PDF packet. Please try again.')
      return null
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const onDownloadPdf = async (): Promise<void> => {
    const blob = await generatePdfBlob()
    if (!blob || !computedSummary) {
      return
    }
    const lastName = packet?.taxpayer?.lastName
    const filename = lastName
      ? `TaxReturn_${lastName}_${computedSummary.taxYear}_${computedSummary.state}.pdf`
      : `TaxReturn_${computedSummary.taxYear}_${computedSummary.state}.pdf`
    downloadBlob(blob, filename)
  }

  const onPrintPdf = async (): Promise<void> => {
    const blob = await generatePdfBlob()
    if (!blob) {
      return
    }
    const tab = openBlobInNewTab(blob)
    if (!tab) {
      setPdfError('Pop-up blocked. Please allow pop-ups to print.')
      return
    }
    tab.addEventListener('load', () => {
      tab.focus()
      tab.print()
    })
  }

  const checklistCompletion = useMemo(() => {
    const total = 10
    const issues =
      errorDiagnostics.length +
      warningDiagnostics.length +
      stateDiagnostics.length
    const remaining = Math.max(total - issues, 0)
    return Math.round((remaining / total) * 100)
  }, [
    errorDiagnostics.length,
    stateDiagnostics.length,
    warningDiagnostics.length
  ])

  return (
    <Box>
      <Typography variant="h5">Diagnostics & Review</Typography>
      <Typography variant="body2" color="textSecondary">
        Validate your return, review totals, and clear diagnostics before PDF.
      </Typography>
      <Box marginTop={2}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} variant="outlined" className={classes.card}>
              <Typography variant="subtitle2">Return Totals</Typography>
              <Divider />
              <Box marginTop={2}>
                {computedReturn ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <div className={classes.metric}>
                        <Typography variant="caption" color="textSecondary">
                          Refund / Amount Owed
                        </Typography>
                        <Typography className={classes.metricValue}>
                          {computedReturn.refundAmount > 0 ? (
                            <Currency value={computedReturn.refundAmount} />
                          ) : computedReturn.amountOwed > 0 ? (
                            <Currency value={-computedReturn.amountOwed} />
                          ) : (
                            '$0'
                          )}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className={classes.metric}>
                        <Typography variant="caption" color="textSecondary">
                          Credits Applied
                        </Typography>
                        <Typography className={classes.metricValue}>
                          {computedReturn.credits}
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className={classes.metric}>
                        <Typography variant="caption" color="textSecondary">
                          AGI
                        </Typography>
                        <Typography className={classes.metricValue}>
                          <Currency
                            value={computedReturn.adjustedGrossIncome}
                          />
                        </Typography>
                      </div>
                    </Grid>
                    <Grid item xs={6}>
                      <div className={classes.metric}>
                        <Typography variant="caption" color="textSecondary">
                          Taxable Income
                        </Typography>
                        <Typography className={classes.metricValue}>
                          <Currency value={computedReturn.taxableIncome} />
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Totals will populate once a return is created.
                  </Typography>
                )}
              </Box>
              <Box marginTop={2} display="flex" style={{ gap: 12 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    void onDownloadPdf()
                  }}
                  disabled={isGeneratingPdf}
                >
                  {isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => {
                    void onPrintPdf()
                  }}
                  disabled={isGeneratingPdf}
                >
                  Print
                </Button>
              </Box>
            </Paper>
            <Box marginTop={2}>
              <Paper elevation={0} variant="outlined" className={classes.card}>
                <Typography variant="subtitle2">Diagnostics</Typography>
                <Divider />
                <Box marginTop={2} className={classes.checklist}>
                  {errorDiagnostics.map((diagnostic) => (
                    <Alert key={diagnostic.id} severity="error">
                      {diagnostic.message}
                    </Alert>
                  ))}
                  {warningDiagnostics.map((diagnostic) => (
                    <Alert key={diagnostic.id} severity="warning">
                      {diagnostic.message}
                    </Alert>
                  ))}
                  {stateDiagnostics.map((diagnostic) => (
                    <Alert key={diagnostic.id} severity="info">
                      {diagnostic.message}
                    </Alert>
                  ))}
                  {federalDiagnostics.length === 0 &&
                  stateDiagnostics.length === 0 ? (
                    <Alert severity="success">
                      No blocking diagnostics found.
                    </Alert>
                  ) : null}
                </Box>
              </Paper>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} variant="outlined" className={classes.card}>
              <Typography variant="subtitle2">Checklist</Typography>
              <Divider />
              <Box marginTop={2} className={classes.checklist}>
                <Chip
                  size="small"
                  label={`Completion ${checklistCompletion}%`}
                  className={classes.chip}
                />
                <Typography variant="body2" color="textSecondary">
                  Capture missing documents and clear validations to reach 100%.
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Federal diagnostics: {federalDiagnostics.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  State diagnostics: {stateDiagnostics.length}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      <Snackbar
        open={pdfError !== null}
        autoHideDuration={6000}
        onClose={() => setPdfError(null)}
      >
        <Alert onClose={() => setPdfError(null)} severity="error">
          {pdfError}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Review
