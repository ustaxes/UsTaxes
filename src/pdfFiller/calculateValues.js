import { getAllDataFlat } from '../redux/selectors'
import { saveFormData } from '../redux/actions'
import { store } from '../redux/store'

export default function calculateValues () {
  const values = {}
  const information = getAllDataFlat(store.getState())
  values.totalIncome = information.income
  values.totalDeduction = information.deduction
  store.dispatch(saveFormData(values, 'calculatedValues'))
}
