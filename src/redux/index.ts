// override default useDispatch with our
// version that lets us curry the tax year
import { Information } from './data'
import {
  useYearDispatch as useDispatch,
  useYearSelector as useSelector
} from './yearDispatch'

export type TaxesState = { information: Information }

export { useDispatch, useSelector }
