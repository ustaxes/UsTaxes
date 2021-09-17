import { Dispatch } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Actions, SignalAction } from './actions'
import { TaxesState, TaxYear } from './data'
import { blankState } from './reducer'
import { TaxesState as TS } from '.'

const useYearDispatch = (): Dispatch<SignalAction> => {
  const dispatch = useDispatch<Dispatch<Actions>>()
  const year: TaxYear = useSelector((state: TaxesState) => state.activeYear)

  return (v: SignalAction) => dispatch(v(year))
}

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
