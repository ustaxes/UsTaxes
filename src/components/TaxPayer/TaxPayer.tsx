import React, { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { savePrimaryPersonInfo } from 'ustaxes/redux/actions'
import {
  Address,
  PersonRole,
  PrimaryPerson,
  TaxesState,
  TaxPayer
} from 'ustaxes/redux/data'
import { PersonFields } from './PersonFields'
import { LabeledCheckbox } from 'ustaxes/components/input'
import { PagerContext } from 'ustaxes/components/pager'
import AddressFields from './Address'

interface TaxPayerUserForm {
  firstName: string
  lastName: string
  ssid: string
  role: PersonRole
  address: Address
  isForeignCountry: boolean
  isTaxpayerDependent: boolean
}

const defaultTaxpayerUserForm: TaxPayerUserForm = {
  firstName: '',
  lastName: '',
  ssid: '',
  role: PersonRole.PRIMARY,
  isForeignCountry: false,
  address: {
    address: '',
    city: '',
    state: '',
    zip: ''
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

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const methods = useForm<TaxPayerUserForm>({
    defaultValues: {
      ...defaultTaxpayerUserForm,
      ...(taxPayer.primaryPerson !== undefined
        ? asTaxPayerUserForm(taxPayer.primaryPerson)
        : {})
    }
  })

  const { handleSubmit } = methods

  const onSubmit =
    (onAdvance: () => void) =>
    (form: TaxPayerUserForm): void => {
      dispatch(savePrimaryPersonInfo(asPrimaryPerson(form)))
      onAdvance()
    }

  const page = (
    <PagerContext.Consumer>
      {({ navButtons, onAdvance }) => (
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <h2>Primary Taxpayer Information</h2>
          <PersonFields />
          <LabeledCheckbox
            label="Check if you are a dependent"
            name="isTaxpayerDependent"
          />
          <AddressFields checkboxText="Do you have a foreign address?" />
          {navButtons}
        </form>
      )}
    </PagerContext.Consumer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}
