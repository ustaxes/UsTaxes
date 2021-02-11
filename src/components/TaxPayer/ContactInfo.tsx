import React, { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { saveContactInfo } from '../../redux/actions'
import { PagedFormProps } from '../pager'
import { ContactInfo as Contact, TaxesState, TaxPayer } from '../../redux/data'

export default function ContactInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, errors } = useForm<Contact>()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const onSubmit = (formData: Contact): void => {
    dispatch(saveContactInfo(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Box display="flex" justifyContent="flex-start">
          <h2>Family Contact Information</h2>
        </Box>
        <LabeledInput
          label="Contact phone number"
          register={register}
          required={true}
          patternConfig={Patterns.usPhoneNumber}
          name="contactPhoneNumber"
          defaultValue={taxPayer?.contactPhoneNumber}
          error={errors.contactPhoneNumber}
        />

        <LabeledInput
          label="Contact email address"
          register={register}
          required={true}
          name="contactEmail"
          defaultValue={taxPayer?.contactEmail}
          error={errors.contactEmail}
        />

        {navButtons}
      </form>
    </Box>
  )
}
