import { ReactElement, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { LabeledInput } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { saveContactInfo } from 'ustaxes/redux/actions'
import { ContactInfo as Contact } from 'ustaxes/redux/data'
import { usePager } from 'ustaxes/components/pager'
import { Grid } from '@material-ui/core'
import _ from 'lodash'

const blankContact: Contact = {
  contactPhoneNumber: '',
  contactEmail: ''
}

export default function ContactInfo(): ReactElement {
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const defaultValues: Contact | undefined = useSelector(
    (state: TaxesState) => {
      const tp = state.information.taxPayer
      return {
        contactPhoneNumber: tp.contactPhoneNumber ?? '',
        contactEmail: tp.contactEmail ?? ''
      }
    }
  )

  const { navButtons, onAdvance } = usePager()

  const methods = useForm<Contact>({ defaultValues })
  const { handleSubmit, reset, getValues } = methods
  const currentValues = { ...blankContact, ...getValues() }

  useEffect(() => {
    if (!_.isEqual(currentValues, defaultValues)) {
      console.log(getValues())
      console.log(defaultValues)
      return reset(defaultValues)
    }
  })

  const onSubmit =
    (onAdvance: () => void) =>
    (formData: Contact): void => {
      dispatch(saveContactInfo(formData))
      onAdvance()
    }

  const page = (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit(onAdvance))}>
      <h2>Family Contact Information</h2>
      <Grid container spacing={2}>
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
      </Grid>
      {navButtons}
    </form>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}
