import React, { ReactElement } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  savePrimaryPersonInfo,
  saveStateResidencyInfo
} from 'ustaxes/redux/actions'
import {
  Address,
  PersonRole,
  PrimaryPerson,
  State,
  StateResidency,
  TaxesState,
  TaxPayer
} from 'ustaxes/redux/data'
import { PersonFields } from './PersonFields'
import { usePager } from 'ustaxes/components/pager'
import { LabeledCheckbox, USStateDropDown } from 'ustaxes/components/input'
import AddressFields from './Address'

interface TaxPayerUserForm {
  firstName: string
  lastName: string
  ssid: string
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

const asTaxPayerUserForm = (person: PrimaryPerson): TaxPayerUserForm => {
  const { role, ...rest } = person
  return {
    ...rest,
    isForeignCountry: person.address.foreignCountry !== undefined,
    role: PersonRole.PRIMARY
  }
}

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
            stateResidency:
              stateResidency[0]?.state ?? taxPayer.primaryPerson.address.state
          }
        : {})
    }
  })

  const { handleSubmit } = methods

  const onSubmit =
    (onAdvance: () => void) =>
    (form: TaxPayerUserForm): void => {
      dispatch(savePrimaryPersonInfo(asPrimaryPerson(form)))
      dispatch(saveStateResidencyInfo({ state: form.stateResidency as State }))
      onAdvance()
    }

  const page = (
    <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
      <h2>Primary Taxpayer Information</h2>
      <PersonFields />
      <LabeledCheckbox
        label="Check if you are a dependent"
        name="isTaxpayerDependent"
      />
      <AddressFields checkboxText="Do you have a foreign address?" />
      <USStateDropDown label="Residency State" name="stateResidency" />
      {navButtons}
    </form>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}
