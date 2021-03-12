import React, { ReactElement } from 'react'
import { Box } from '@material-ui/core'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { Dependent, TaxesState, TaxPayer } from '../../redux/data'
import { PagerContext } from '../pager'
import ScheduleEIC from '../../irsForms/ScheduleEIC'

interface QualifyingDependentUserForm {
  info: string
}

const EICInfo = (): ReactElement => {
  const { handleSubmit } = useForm<QualifyingDependentUserForm>()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) =>
    state.information.taxPayer
  )

  const eic = new ScheduleEIC(taxPayer)

  return (
    <Box display="flex" justifyContent="center">
      <Box display="flex" justifyContent="flex-start">
        <h2>Earned Income Credit (EIC)</h2>
      </Box>
      {
        eic.qualifyingDependents()
          .filter((d) => d !== undefined)
          .map((d) => (d as Dependent))
          .map((dep, i) =>
          <div key={i}>
            <span>{dep.firstName}&nbsp;</span>
            <span>{dep.lastName}</span>:
            <span>{dep.qualifyingInfo?.dob.toLocaleDateString()}</span>
          </div>
          )
      }
    </Box>
  )
}

export default EICInfo
