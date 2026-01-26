import { ReactElement } from 'react'
import { useSelector } from 'react-redux'
import { YearsTaxesState } from 'ustaxes/redux'
import { Information, TaxYears } from 'ustaxes/core/data'
import _ from 'lodash'
import { enumKeys } from 'ustaxes/core/util'
import { useDispatch } from 'ustaxes/redux'
import { setInfo } from 'ustaxes/redux/actions'
import { Button } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const stripSourceFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => stripSourceFields(item))
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const record = value as Record<string, unknown>
    const next = Object.entries(record).reduce<Record<string, unknown>>(
      (acc, [key, val]) => {
        if (key === 'sources') {
          acc[key] = val
          return acc
        }
        if (key.endsWith('_source')) {
          return acc
        }
        acc[key] = stripSourceFields(val)
        return acc
      },
      {}
    )
    return next
  }
  return value
}

const DataPropagator = (): ReactElement => {
  const wholeState = useSelector((state: YearsTaxesState) => state)
  const allYears = enumKeys(TaxYears)
  const yearIndex = _.indexOf(allYears, wholeState.activeYear)
  const dispatch = useDispatch()

  const currentYear: Information = wholeState[wholeState.activeYear]
  const priorYear: Information = wholeState[allYears[yearIndex - 1]]

  const canPropagate =
    yearIndex > 0 &&
    currentYear.taxPayer.primaryPerson?.firstName === undefined &&
    priorYear.taxPayer.primaryPerson?.firstName !== undefined

  const onClick = () => {
    if (canPropagate) {
      dispatch(setInfo(stripSourceFields(priorYear) as Information))
    }
  }

  if (canPropagate) {
    return (
      <div>
        <Alert severity="info">
          <p>
            You have data from the prior tax year but no data for the current
            tax year. Would you like to migrate your data from the prior year?
          </p>
          <Button onClick={onClick} variant="contained" color="primary">
            Migrate
          </Button>
        </Alert>
      </div>
    )
  }
  return <></>
}

export default DataPropagator
