import { Dispatch } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Actions, SignalAction } from './actions'
import { TaxesState, TaxYear } from './data'
import { blankState } from './reducer'
import { TaxesState as TS } from '.'

/**
 * Provides an override over the default redux dispatch
 * so that the user can send events and watch state
 * ignoring the current active year. Modifications
 * are posted to the current selected year.
 */
const useYearDispatch = (): Dispatch<SignalAction> => {
  const dispatch = useDispatch<Dispatch<Actions>>()
  const year: TaxYear = useSelector((state: TaxesState) => state.activeYear)

  return (v: SignalAction) => dispatch(v(year))
}

/**
 * Provides an override of the useSelector hook for
 * UI that doesn't care which year's data is currently
 * being accessed
 */
const useYearSelector = <R>(f: (t: TS) => R): R =>
  f(
    useSelector((state: TaxesState) => ({
      information:
        state.activeYear === undefined
          ? blankState
          : state[state.activeYear] ?? blankState
    }))
  )

export { useYearDispatch, useYearSelector }
