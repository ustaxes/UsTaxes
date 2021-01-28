import React, { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { saveTaxpayerInfo } from '../../redux/actions'
import { PagedFormProps } from '../pager'
import { TaxesState, TaxPayer } from '../../redux/data'
import { PersonFields } from './PersonFields'

export default function TaxPayerInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, errors } = useForm()
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
          <h2>Taxpayer Information</h2>
        </Box>

        <h4>Primary Taxpayer Information</h4>
        <PersonFields
          namePrefix="primaryPerson."
          register={register}
          errors={errors}
          defaults={taxPayer?.primaryPerson}
        />

        {navButtons}
      </form>
    </Box>
  )
}
