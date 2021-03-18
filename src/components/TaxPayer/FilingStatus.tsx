import React, { ReactElement } from 'react'

import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { GenericLabeledDropdown } from '../input'
import { saveFilingStatusInfo } from '../../redux/actions'
import { TaxesState, TaxPayer, FilingStatus, FilingStatusTexts, filingStatuses } from '../../redux/data'
import { PagerContext } from '../pager'

export default function FilingStatusSelect (): ReactElement {
  const { handleSubmit, errors, control } = useForm<{filingStatus: FilingStatus}>()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const onSubmit = (onAdvance: () => void) => (formData: {filingStatus: FilingStatus}): void => {
    dispatch(saveFilingStatusInfo(formData.filingStatus))
    onAdvance()
  }

  return (
    <PagerContext.Consumer>
      {({ onAdvance, navButtons }) =>
        <Box display="flex" justifyContent="center">
          <form onSubmit={handleSubmit(onSubmit(onAdvance))}>

            <Box display="flex" justifyContent="flex-start">
              <h2>Filing Status</h2>
            </Box>

            <GenericLabeledDropdown<FilingStatus>
              label=""
              dropDownData={filingStatuses(taxPayer)}
              valueMapping={(x, i) => x}
              keyMapping={(x, i) => i}
              error={errors.filingStatus}
              textMapping={status => FilingStatusTexts[status]}
              required={true}
              control={control}
              name="filingStatus"
              defaultValue={taxPayer?.filingStatus}
            />

            {navButtons}
          </form>
        </Box>
      }
    </PagerContext.Consumer>
  )
}
