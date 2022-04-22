import { Dispatch } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SignalAction } from './actions'
import { YearsTaxesState } from '.'
import { TaxYear } from 'ustaxes/core/data'
import { TaxesState } from '.'

/**
 * Provides an override over the default redux dispatch
 * so that the user can send events and watch state
 * ignoring the current active year. Modifications
 * are posted to the current selected year.
 */
const useYearDispatch = (): Dispatch<SignalAction> => {
  const dispatch = useDispatch()
  const year: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  return (v: SignalAction) => dispatch(v(year))
}

/**
 * Provides an override of the useSelector hook for
 * UI that doesn't care which year's data is currently
 * being accessed.
 */
const useYearSelector = <R>(f: (t: TaxesState) => R): R =>
  f(
    useSelector((state: YearsTaxesState) => ({
      information: state[state.activeYear]
    }))
  )

export { useYearDispatch, useYearSelector }
