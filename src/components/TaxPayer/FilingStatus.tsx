import React, { ReactElement } from 'react'

import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { GenericLabeledDropdown } from '../input'
import { saveTaxpayerInfo } from '../../redux/actions'
import { PagedFormProps } from '../pager'
import { TaxesState, TaxPayer, FilingStatus, FilingStatusTexts, filingStatuses } from '../../redux/data'

export default function FilingStatusSelect ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { handleSubmit, errors, control } = useForm<TaxPayer>()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const onSubmit = (formData: TaxPayer): void => {
    console.log('formData: ', formData)
    dispatch(saveTaxpayerInfo(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h4>Filing Status</h4>
        </Box>

        <GenericLabeledDropdown<FilingStatus>
          label="Filing Status"
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
  )
}
