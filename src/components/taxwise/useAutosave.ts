import { useEffect, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash/debounce'
import isEqual from 'lodash/isEqual'
import { YearsTaxesState } from 'ustaxes/redux'
import { addAuditLogEntry, setSaveStatus } from 'ustaxes/redux/actions'
import { AuditLogEntry, SaveStatus } from 'ustaxes/redux/types'
import { TaxYear } from 'ustaxes/core/data'

type AutosaveSnapshot = Omit<YearsTaxesState, 'auditLog' | 'ui'>

const buildAuditEntry = (year: TaxYear): AuditLogEntry => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  timestamp: new Date().toISOString(),
  actor: 'Current User',
  action: 'Autosave',
  year
})

export const useAutosave = (): SaveStatus => {
  const dispatch = useDispatch()
  const activeYear = useSelector((state: YearsTaxesState) => state.activeYear)
  const saveStatus = useSelector(
    (state: YearsTaxesState) => state.ui.saveStatus
  )

  const autosaveSnapshot = useSelector((state: YearsTaxesState) => {
    const { auditLog, ui, ...snapshot } = state
    void auditLog
    void ui
    return snapshot
  })

  const previous = useRef<AutosaveSnapshot | null>(null)

  const finalizeSave = useMemo(
    () =>
      debounce(() => {
        dispatch(setSaveStatus('saved')(activeYear))
        dispatch(addAuditLogEntry(buildAuditEntry(activeYear))(activeYear))
      }, 800),
    [activeYear, dispatch]
  )

  useEffect(() => {
    if (previous.current === null) {
      previous.current = autosaveSnapshot
      return undefined
    }

    if (isEqual(previous.current, autosaveSnapshot)) {
      return undefined
    }

    previous.current = autosaveSnapshot
    dispatch(setSaveStatus('saving')(activeYear))
    finalizeSave()

    return () => {
      finalizeSave.cancel()
    }
  }, [activeYear, autosaveSnapshot, dispatch, finalizeSave])

  return saveStatus
}
