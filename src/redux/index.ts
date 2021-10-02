// override default useDispatch with our
// version that lets us curry the tax year
import { Information } from './data'
import {
  useYearDispatch as useDispatch,
  useYearSelector as useSelector
} from './yearDispatch'

/**
 * This is a simplified form of our global TaxesState
 * which allows TaxesState to be viewed as if if contained
 * data for a single year.
 */
export type TaxesState = { information: Information }

export { useDispatch, useSelector }
