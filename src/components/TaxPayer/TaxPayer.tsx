import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import _ from 'lodash'
import { useDispatch, useSelector } from 'react-redux'
import {
  savePrimaryPersonInfo,
  saveStateResidencyInfo,
  saveContactInfo
} from 'ustaxes/redux/actions'
import {
  Address,
  ContactInfo,
  PersonRole,
  PrimaryPerson,
  State,
  StateResidency,
  TaxesState,
  TaxPayer
} from 'ustaxes/redux/data'
import { PersonFields } from './PersonFields'
import { usePager } from 'ustaxes/components/pager'
import {
  LabeledCheckbox,
  USStateDropDown,
  LabeledInput
} from 'ustaxes/components/input'
import { Prompt } from 'ustaxes/components/Prompt'
import AddressFields from './Address'
import { Grid } from '@material-ui/core'
import { Patterns } from 'ustaxes/components/Patterns'

interface TaxPayerUserForm {
  firstName: string
  lastName: string
  ssid: string
  contactPhoneNumber?: string
  contactEmail?: string
  role: PersonRole
  address: Address
  isForeignCountry: boolean
  isTaxpayerDependent: boolean
  stateResidency?: State
}

const defaultTaxpayerUserForm: TaxPayerUserForm = {
  firstName: '',
  lastName: '',
  ssid: '',
  contactPhoneNumber: '',
  contactEmail: '',
  role: PersonRole.PRIMARY,
  isForeignCountry: false,
  address: {
    address: '',
    city: ''
  },
  isTaxpayerDependent: false
}

const asPrimaryPerson = (formData: TaxPayerUserForm): PrimaryPerson => ({
  address: formData.address,
  firstName: formData.firstName,
  lastName: formData.lastName,
  ssid: formData.ssid.replace(/-/g, ''),
  isTaxpayerDependent: formData.isTaxpayerDependent,
  role: PersonRole.PRIMARY
})

const asContactInfo = (formData: TaxPayerUserForm): ContactInfo => ({
  contactPhoneNumber: formData.contactPhoneNumber,
  contactEmail: formData.contactEmail
})

const asTaxPayerUserForm = (person: PrimaryPerson): TaxPayerUserForm => ({
  ...person,
  isForeignCountry: person.address.foreignCountry !== undefined,
  role: PersonRole.PRIMARY
})

export default function PrimaryTaxpayer(): ReactElement {
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const { onAdvance, navButtons } = usePager()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const stateResidency: StateResidency[] = useSelector(
    (state: TaxesState) => state.information.stateResidencies
  )

  const methods = useForm<TaxPayerUserForm>({
    defaultValues: {
      ...defaultTaxpayerUserForm,
      ...(taxPayer.primaryPerson !== undefined
        ? {
            ...asTaxPayerUserForm(taxPayer.primaryPerson),
            contactPhoneNumber: taxPayer.contactPhoneNumber,
            contactEmail: taxPayer.contactEmail,
            stateResidency:
              stateResidency[0]?.state ?? taxPayer.primaryPerson.address.state
          }
        : {})
    }
  })

  const {
    handleSubmit,
    formState: { errors }
  } = methods

  const onSubmit = (form: TaxPayerUserForm): void => {
    dispatch(savePrimaryPersonInfo(asPrimaryPerson(form)))
    dispatch(saveContactInfo(asContactInfo(form)))
    dispatch(saveStateResidencyInfo({ state: form.stateResidency as State }))
    onAdvance()
  }

  const page = (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit)}>
      <Prompt when={!_.isEmpty(errors)} />
      <Helmet>
        <title>Primary Taxpayer Information | Personal | UsTaxes.org</title>
      </Helmet>
      <h2>Primary Taxpayer Information</h2>
      <Grid container spacing={2}>
        <PersonFields />
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
        <LabeledCheckbox
          label="Check if you are a dependent"
          name="isTaxpayerDependent"
        />
        <AddressFields checkboxText="Do you have a foreign address?" />
        <USStateDropDown label="Residency State" name="stateResidency" />
      </Grid>
      {navButtons}
    </form>
  )
  return <FormProvider {...methods}>{page}</FormProvider>
}
