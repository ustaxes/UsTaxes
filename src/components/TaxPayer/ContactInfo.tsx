import React, { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { saveContactInfo } from 'ustaxes/redux/actions'
import {
  ContactInfo as Contact,
  TaxesState,
  TaxPayer
} from 'ustaxes/redux/data'
import { PagerContext } from 'ustaxes/components/pager'

export default function ContactInfo(): ReactElement {
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const defaultValues: TaxPayer | undefined = useSelector(
    (state: TaxesState) => {
      return state.information.taxPayer
    }
  )

  const methods = useForm<Contact>({ defaultValues })
  const { handleSubmit } = methods

  const onSubmit =
    (onAdvance: () => void) =>
    (formData: Contact): void => {
      dispatch(saveContactInfo(formData))
      onAdvance()
    }

  const page = (
    <PagerContext.Consumer>
      {({ navButtons, onAdvance }) => (
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <h2>Family Contact Information</h2>
          <LabeledInput
            label="Contact phone number"
            patternConfig={Patterns.usPhoneNumber}
            name="contactPhoneNumber"
          />
          <LabeledInput
            label="Contact email address"
            required={true}
            name="contactEmail"
          />
          {navButtons}
        </form>
      )}
    </PagerContext.Consumer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}
