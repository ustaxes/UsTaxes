import { ReactElement, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import _ from 'lodash'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'

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
  TaxPayer
} from 'ustaxes/core/data'
import { PersonFields } from './PersonFields'
import { usePager } from 'ustaxes/components/pager'
import {
  LabeledCheckbox,
  USStateDropDown,
  LabeledInput
} from 'ustaxes/components/input'
import AddressFields from './Address'
import { Grid } from '@material-ui/core'
import { Patterns } from 'ustaxes/components/Patterns'
import { intentionallyFloat } from 'ustaxes/core/util'

interface TaxPayerUserForm {
  firstName: string
  initial?: string
  lastName: string
  ssid: string
  contactPhoneNumber?: string
  contactEmail?: string
  role: PersonRole
  address: Address
  isForeignCountry: boolean
  isTaxpayerDependent: boolean
  stateResidency?: State
  isBlind: boolean
  dateOfBirth?: Date
}

const defaultTaxpayerUserForm: TaxPayerUserForm = {
  firstName: '',
  initial: '',
  lastName: '',
  ssid: '',
  contactPhoneNumber: '',
  contactEmail: '',
  role: PersonRole.PRIMARY,
  isForeignCountry: false,
  address: {
    address: '',
    city: '',
    aptNo: '',
    state: undefined,
    zip: undefined
  },
  isTaxpayerDependent: false,
  isBlind: false,
  dateOfBirth: undefined
}

const asPrimaryPerson = (formData: TaxPayerUserForm): PrimaryPerson<string> => {
  if (formData.dateOfBirth === undefined) {
    throw new Error('Called with undefined date of birth')
  }
  return {
    address: formData.address,
    firstName: formData.firstName,
    initial: formData.initial,
    lastName: formData.lastName,
    ssid: formData.ssid.replace(/-/g, ''),
    isTaxpayerDependent: formData.isTaxpayerDependent,
    role: PersonRole.PRIMARY,
    dateOfBirth: formData.dateOfBirth.toISOString(),
    isBlind: formData.isBlind
  }
}

const asContactInfo = (formData: TaxPayerUserForm): ContactInfo => ({
  contactPhoneNumber: formData.contactPhoneNumber,
  contactEmail: formData.contactEmail
})

const asTaxPayerUserForm = (person: PrimaryPerson): TaxPayerUserForm => ({
  ...person,
  isForeignCountry: person.address.foreignCountry !== undefined,
  role: PersonRole.PRIMARY,
  dateOfBirth: new Date(person.dateOfBirth)
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

  const newTpForm: TaxPayerUserForm = {
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

  const methods = useForm<TaxPayerUserForm>({
    defaultValues: newTpForm
  })

  const {
    handleSubmit,
    getValues,
    reset,
    formState: { isDirty }
  } = methods

  // This form can be rerendered because the global state was modified by
  // another control.
  const currentValues = { ...defaultTaxpayerUserForm, ...getValues() }

  useEffect(() => {
    if (!isDirty && !_.isEqual(currentValues, newTpForm)) {
      return reset(newTpForm)
    }
  })

  const onSubmit = (form: TaxPayerUserForm): void => {
    dispatch(savePrimaryPersonInfo(asPrimaryPerson(form)))
    dispatch(saveContactInfo(asContactInfo(form)))
    dispatch(saveStateResidencyInfo({ state: form.stateResidency as State }))
    onAdvance()
  }

  const page = (
    <form tabIndex={-1} onSubmit={intentionallyFloat(handleSubmit(onSubmit))}>
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
