import { Button, TextField } from '@material-ui/core'
import { Check } from '@material-ui/icons'
import { ReactElement, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { TaxYear, TaxYears } from 'ustaxes/core/data'
import { enumKeys } from 'ustaxes/core/util'
import {
  applyReturnPayload,
  buildReturnPayload,
  ReturnPayload
} from 'ustaxes/prefill/transcriptPrefill'
import { setActiveYear, setInfo } from 'ustaxes/redux/actions'
import { YearsTaxesState } from 'ustaxes/redux/data'
import { download } from 'ustaxes/redux/fs'
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

  useEffect(() => {
    const storedStatus = sessionStorage.getItem('ustaxes.prefillStatus')
    if (storedStatus) {
      setPrefillStatus(storedStatus)
      setPrefillDone(true)
      sessionStorage.removeItem('ustaxes.prefillStatus')
    }
  }, [])

  const downloadPrefill = (taxYear: TaxYear): void => {
    const payload = buildReturnPayload(yearsState[taxYear], taxYear)
    download(`ustaxes_return_${taxYear}.json`, JSON.stringify(payload, null, 2))
  }

  const downloadAllPrefills = (): void => {
    const returns = Object.fromEntries(
      validTaxYears.map((year) => [
        year,
        buildReturnPayload(yearsState[year], year)
      ])
    )
    const payload = {
      version: '1.0.0',
      returns
    }
    download('ustaxes_return_bundle.json', JSON.stringify(payload, null, 2))
  }

  const applyPrefill = (raw: string): void => {
    setPrefillError(undefined)
    setPrefillStatus(undefined)

    if (raw.trim().length === 0) {
      setPrefillError('Paste or upload return JSON to prefill.')
      return
    }

    try {
      const parsed = JSON.parse(raw) as unknown
      const record = parsed as Record<string, unknown>
      const bundleReturns = record.returns as
        | Record<string, ReturnPayload>
        | undefined
      const payload: ReturnPayload | undefined = bundleReturns
        ? (() => {
            const activeYear = record.activeYear
            const yearFromActive = isValidTaxYear(String(activeYear))
              ? (activeYear as TaxYear)
              : undefined
            const yearFromKeys = Object.keys(bundleReturns).find((key) =>
              isValidTaxYear(key)
            ) as TaxYear | undefined
            const selectedYear = yearFromActive ?? yearFromKeys
            if (selectedYear === undefined) {
              return undefined
            }
            return bundleReturns[selectedYear]
          })()
        : (record as ReturnPayload)

      const taxYear = payload?.taxYear
      const info = payload?.information

      if (taxYear === undefined || info === undefined) {
        throw new Error('Missing taxYear or information in return payload.')
      }
      if (!isValidTaxYear(taxYear)) {
        throw new Error(`Unsupported tax year: ${String(taxYear)}`)
      }

      const currentInfo = yearsState[taxYear]
      const nextInfo = applyReturnPayload(currentInfo, {
        taxYear,
        information: {
          taxPayer: info.taxPayer,
          w2s: info.w2s,
          f1099s: info.f1099s,
          f1098s: info.f1098s,
          realEstate: info.realEstate,
          adjustments: info.adjustments,
          sources: info.sources
        }
      })

      dispatch(setInfo(nextInfo)(taxYear))
      dispatch(setActiveYear(taxYear)(taxYear))
      setPrefillDone(true)

      const counts = {
        w2s: info.w2s?.length ?? 0,
        f1099s: info.f1099s?.length ?? 0,
        f1098s: info.f1098s?.length ?? 0,
        realEstate: info.realEstate?.length ?? 0,
        taxPayer: info.taxPayer ? 1 : 0,
        adjustments:
          info.adjustments &&
          (info.adjustments.alimonyPaid !== undefined ||
            info.adjustments.alimonyRecipientSsn !== undefined ||
            info.adjustments.alimonyDivorceDate !== undefined)
            ? 1
            : 0
      }
      const filledCount =
        counts.w2s +
        counts.f1099s +
        counts.f1098s +
        counts.realEstate +
        counts.taxPayer +
        counts.adjustments

      const summary =
        filledCount === 0
          ? 'No importable fields found in the JSON.'
          : `Imported ${counts.w2s} W-2s, ${counts.f1099s} 1099s, ${
              counts.f1098s
            } 1098s, ${counts.realEstate} rental properties${
              counts.taxPayer ? ', tax payer info' : ''
            }${counts.adjustments ? ', adjustments to income' : ''}.`

      const status = `Prefill applied for ${taxYear}. ${summary}`
      setPrefillStatus(status)
      sessionStorage.setItem('ustaxes.prefillStatus', status)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to parse return JSON.'
      setPrefillError(message)
    }
  }

  return (
    <>
      <h2>User Settings</h2>
      <h3>Save data</h3>
      <p>
        Save a full backup of all years and settings for import into another
        UsTaxes install or the desktop application.
      </p>
      <SaveToFile variant="contained" color="primary">
        Save data to file
      </SaveToFile>
      <h3>Load data</h3>
      <p>
        Load a full backup file. Warning, this will overwrite the current data
        for all years.
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
      <h3>Prefill from return JSON</h3>
      <p>
        Upload or paste return JSON to prefill select forms (W-2s, 1099s, 1098s,
        rental properties). Existing entries for those forms will be replaced.
      </p>
      <LoadRaw
        startIcon={prefillDone ? <Check /> : undefined}
        accept="*.json"
        handleData={(contents) => applyPrefill(contents)}
        variant="contained"
        color="primary"
      >
        Upload return JSON
      </LoadRaw>
      <TextField
        label="Paste return JSON"
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
      <h3>Download return JSON</h3>
      <p>
        Export a portable return JSON (subset of data), either for the active
        year or all years in a single bundle.
      </p>
      <Button
        variant="contained"
        color="primary"
        onClick={() => downloadPrefill(yearsState.activeYear)}
      >
        Download active year return JSON
      </Button>
      <Button variant="outlined" color="primary" onClick={downloadAllPrefills}>
        Download all years return JSON
      </Button>
      <h3>Delete data</h3>
      <ClearLocalStorage variant="contained" color="primary">
        Clear Local Storage
      </ClearLocalStorage>
    </>
  )
}

export default UserSettings
