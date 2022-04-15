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
      dispatch(setInfo(priorYear))
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
