import React, { ReactElement } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { saveContactInfo } from '../../redux/actions'
import { ContactInfo as Contact, TaxesState, TaxPayer } from '../../redux/data'
import { PagerContext } from '../pager'

export default function ContactInfo (): ReactElement {
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const defaultValues: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const methods = useForm<Contact>({ defaultValues })
  const { handleSubmit } = methods

  const onSubmit = (onAdvance: () => void) => (formData: Contact): void => {
    dispatch(saveContactInfo(formData))
    onAdvance()
  }

  const page = (
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <h2>Family Contact Information</h2>
          <LabeledInput
            label="Contact phone number"
            required={true}
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
      }
    </PagerContext.Consumer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}
