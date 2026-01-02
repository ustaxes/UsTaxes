import { ReactElement, useEffect, useMemo, useState } from 'react'
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
import { Asset, Information, TaxYear, TaxYears } from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'
import yearFormBuilder from 'ustaxes/forms/YearForms'
import Summary from 'ustaxes/components/Summary'
import Form from 'ustaxes/core/irsForms/Form'
import StateForm from 'ustaxes/core/stateForms/Form'
import { createSummary } from 'ustaxes/components/SummaryData'
import { Currency } from 'ustaxes/components/input'
import { run } from 'ustaxes/core/util'
import { buildDiagnostics } from '../validation/diagnostics'
import { getModule } from 'ustaxes/core/stateModules/StateRegistry'
import { buildReturnPacket } from 'ustaxes/core/returnPacket/adapters'
import { TaxReturnPacket } from 'ustaxes/core/returnPacket/types'
import { generateClientPacketPdf } from 'ustaxes/pdf/ClientPacketPdf'
import { ComputedSummary, PdfDiagnostic } from 'ustaxes/pdf/pdfTypes'
import { downloadBlob, openBlobInNewTab } from 'ustaxes/pdf/downloadPdf'

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
  const [irsErrors, setIrsErrors] = useState<string[]>([])
  const [stateErrors, setStateErrors] = useState<string[]>([])
  const [irsForms, setIrsForms] = useState<Form[]>([])
  const [stateForms, setStateForms] = useState<StateForm[]>([])
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfError, setPdfError] = useState<string | null>(null)

  const year: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )
  const info: Information = useSelector(
    (state: YearsTaxesState) => state[state.activeYear]
  )
  const assets: Asset<Date>[] = useSelector(
    (state: YearsTaxesState) => state.assets
  )
  const activeReturnId = useSelector(
    (state: YearsTaxesState) => state.activeReturnId
  )
  const returns = useSelector((state: YearsTaxesState) => state.returns)
  const auditLog = useSelector((state: YearsTaxesState) => state.auditLog)

  const diagnostics = useMemo(() => buildDiagnostics(info), [info])
  const errorDiagnostics = diagnostics.filter((d) => d.level === 'error')
  const warningDiagnostics = diagnostics.filter((d) => d.level === 'warning')
  const activeReturn = useMemo(
    () => returns.find((item) => item.id === activeReturnId),
    [activeReturnId, returns]
  )
  const stateDiagnostics = useMemo(() => {
    if (!activeReturn) {
      return []
    }
    const packet = buildReturnPacket(info, activeReturn, auditLog)
    const module = getModule(activeReturn.state)
    if (!module) {
      return []
    }
    const computeResult = module.compute(packet)
    return computeResult.diagnostics
  }, [activeReturn, auditLog, info])

  const packet = useMemo<TaxReturnPacket | null>(() => {
    if (!activeReturn) {
      return null
    }
    return buildReturnPacket(info, activeReturn, auditLog)
  }, [activeReturn, auditLog, info])

  const computedSummary = useMemo<ComputedSummary | null>(() => {
    if (!activeReturn) {
      return null
    }
    const f1040 = irsForms.find((form) => form.tag === 'f1040') as
      | Record<string, () => number | undefined>
      | undefined
    const getLine = (line: string): number | undefined =>
      f1040 && typeof f1040[line] === 'function' ? f1040[line]() : undefined

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
        refundAmount: getLine('l35a'),
        amountOwed: getLine('l37'),
        adjustedGrossIncome: getLine('l11'),
        taxableIncome: getLine('l15'),
        totalTax: getLine('l24'),
        payments: getLine('l33'),
        credits: getLine('l32')
      },
      diagnostics: {
        federal: mapDiagnostics(diagnostics),
        state: mapDiagnostics(stateDiagnostics)
      }
    }
  }, [activeReturn, diagnostics, irsForms, packet, stateDiagnostics])

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

  useEffect(() => {
    const builder = yearFormBuilder(year, info, assets)
    const f1040Errors = builder.errors()
    setIrsErrors(f1040Errors)

    if (f1040Errors.length > 0) {
      setStateErrors(['Resolve federal errors before preparing state return.'])
      setStateForms([])
      setIrsForms([])
    } else {
      const irsRes = builder.f1040()
      const stateRes = builder.makeStateReturn()

      run(irsRes).fold(setIrsErrors, (forms) => {
        setIrsErrors([])
        setIrsForms(forms)
      })

      run(stateRes).fold(setStateErrors, (forms) => {
        setStateErrors([])
        setStateForms(forms)
      })
    }
  }, [assets, info, year])

  const summary = useMemo(
    () => (irsForms.length > 0 ? createSummary(year, irsForms) : undefined),
    [irsForms, year]
  )

  const checklistCompletion = useMemo(() => {
    const total = 10
    const issues =
      irsErrors.length +
      errorDiagnostics.length +
      warningDiagnostics.length +
      stateDiagnostics.length
    const remaining = Math.max(total - issues, 0)
    return Math.round((remaining / total) * 100)
  }, [
    errorDiagnostics.length,
    irsErrors.length,
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
                {summary ? (
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <div className={classes.metric}>
                        <Typography variant="caption" color="textSecondary">
                          Refund / Amount Owed
                        </Typography>
                        <Typography className={classes.metricValue}>
                          {summary.refundAmount ? (
                            <Currency value={summary.refundAmount} />
                          ) : summary.amountOwed ? (
                            <Currency value={-summary.amountOwed} />
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
                          {summary.credits.length}
                        </Typography>
                      </div>
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Totals will populate once federal forms are generated for
                    this year.
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
                  {irsErrors.map((error) => (
                    <Alert key={error} severity="warning">
                      {error}
                    </Alert>
                  ))}
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
                  {stateErrors.map((error) => (
                    <Alert key={error} severity="info">
                      {error}
                    </Alert>
                  ))}
                  {irsErrors.length === 0 &&
                  stateErrors.length === 0 &&
                  diagnostics.length === 0 &&
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
                <Summary
                  errors={irsErrors}
                  stateErrors={stateErrors}
                  irsForms={irsForms}
                  stateForms={stateForms}
                />
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
