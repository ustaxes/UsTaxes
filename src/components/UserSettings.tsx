import { Button, TextField } from '@material-ui/core'
import { Check } from '@material-ui/icons'
import { ReactElement, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TaxYear, TaxYears } from 'ustaxes/core/data'
import { enumKeys } from 'ustaxes/core/util'
import {
  applyTranscriptPrefill,
  TranscriptPrefill
} from 'ustaxes/prefill/transcriptPrefill'
import { setActiveYear, setInfo } from 'ustaxes/redux/actions'
import { YearsTaxesState } from 'ustaxes/redux/data'
import { fsRecover } from 'ustaxes/redux/fs/Actions'
import { LoadRaw } from 'ustaxes/redux/fs/Load'
import SaveToFile from './SaveToFile'
import ClearLocalStorage from './ClearLocalStorage'

const validTaxYears = enumKeys(TaxYears)

const isValidTaxYear = (value: string): value is TaxYear =>
  validTaxYears.includes(value as TaxYear)

const UserSettings = (): ReactElement => {
  const dispatch = useDispatch()
  const [done, setDone] = useState(false)
  const [prefillDone, setPrefillDone] = useState(false)
  const [prefillText, setPrefillText] = useState('')
  const [prefillError, setPrefillError] = useState<string | undefined>(
    undefined
  )
  const [prefillStatus, setPrefillStatus] = useState<string | undefined>(
    undefined
  )
  const yearsState = useSelector((state: YearsTaxesState) => state)

  const applyPrefill = (raw: string): void => {
    setPrefillError(undefined)
    setPrefillStatus(undefined)

    if (raw.trim().length === 0) {
      setPrefillError('Paste or upload transcript JSON to prefill.')
      return
    }

    try {
      const parsed = JSON.parse(raw) as Partial<TranscriptPrefill>
      const taxYear = parsed.taxYear
      const taxPayer = parsed.taxPayer

      if (taxYear === undefined || taxPayer === undefined) {
        throw new Error('Missing taxYear or taxPayer in transcript payload.')
      }
      if (!isValidTaxYear(taxYear)) {
        throw new Error(`Unsupported tax year: ${String(taxYear)}`)
      }

      const currentInfo = yearsState[taxYear]
      const nextInfo = applyTranscriptPrefill(currentInfo, {
        taxYear,
        taxPayer,
        source: parsed.source,
        createdAt: parsed.createdAt,
        w2s: parsed.w2s,
        f1099s: parsed.f1099s,
        f1098s: parsed.f1098s
      })

      dispatch(setInfo(nextInfo)(taxYear))
      dispatch(setActiveYear(taxYear)(taxYear))
      setPrefillDone(true)
      setPrefillStatus(`Prefill applied for ${taxYear}.`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to parse transcript.'
      setPrefillError(message)
    }
  }

  return (
    <>
      <h2>User Settings</h2>
      <h3>Save data</h3>
      <p>Save your data for backup or to import into desktop application</p>
      <SaveToFile variant="contained" color="primary">
        Save data to file
      </SaveToFile>
      <h3>Load data</h3>
      <p>
        Load your saved data from a file. Warning, this will overwrite present
        state.
      </p>
      <LoadRaw
        startIcon={done ? <Check /> : undefined}
        accept="*.json"
        handleData={(state) => {
          if (!done) {
            dispatch(fsRecover(state))
            setDone(true)
          }
        }}
        variant="contained"
        color="primary"
      >
        Load
      </LoadRaw>
      <h3>Prefill from transcript JSON</h3>
      <p>
        Upload or paste the Wage &amp; Income transcript JSON to prefill W-2s,
        1099s, and 1098s. Existing entries for those forms will be replaced.
      </p>
      <LoadRaw
        startIcon={prefillDone ? <Check /> : undefined}
        accept="*.json"
        handleData={(contents) => applyPrefill(contents)}
        variant="contained"
        color="primary"
      >
        Upload transcript JSON
      </LoadRaw>
      <TextField
        label="Paste transcript JSON"
        multiline
        minRows={4}
        value={prefillText}
        onChange={(event) => setPrefillText(event.target.value)}
        variant="outlined"
        fullWidth
        margin="normal"
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => applyPrefill(prefillText)}
      >
        Apply pasted JSON
      </Button>
      {prefillStatus ? <p>{prefillStatus}</p> : null}
      {prefillError ? <p>{prefillError}</p> : null}
      <h3>Delete data</h3>
      <ClearLocalStorage variant="contained" color="primary">
        Clear Local Storage
      </ClearLocalStorage>
    </>
  )
}

export default UserSettings
