import React, { ReactElement } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { savePrimaryPersonInfo } from '../../redux/actions'
import { Address, PersonRole, PrimaryPerson, TaxesState, TaxPayer } from '../../redux/data'
import { PersonFields } from './PersonFields'
import { LabeledCheckbox } from '../input'
import { PagerContext } from '../pager'
import AddressFields from './Address'

interface TaxPayerUserForm {
  firstName: string
  lastName: string
  ssid: string
  role: PersonRole
  address: Address
  isTaxpayerDependent: boolean
}

const asPrimaryPerson = (formData: TaxPayerUserForm): PrimaryPerson => ({
  address: formData.address,
  firstName: formData.firstName,
  lastName: formData.lastName,
  ssid: formData.ssid.replace(/-/g, ''),
  isTaxpayerDependent: formData.isTaxpayerDependent,
  role: PersonRole.PRIMARY
})

export default function PrimaryTaxpayer (): ReactElement {
  const { register, handleSubmit, control, errors } = useForm<PrimaryPerson>()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const taxPayer: TaxPayer | undefined = useSelector((state: TaxesState) => {
    return state.information.taxPayer
  })

  const isForeignCountry = useWatch<boolean>({
    control,
    name: 'isForeignCountry',
    defaultValue: taxPayer?.primaryPerson?.address.foreignCountry !== undefined
  })

  const onSubmit = (onAdvance: () => void) => (primaryPerson: PrimaryPerson): void => {
    dispatch(savePrimaryPersonInfo(asPrimaryPerson(primaryPerson)))
    onAdvance()
  }

  return (
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
          <h2>Primary Taxpayer Information</h2>
          <PersonFields
            register={register}
            errors={errors}
            defaults={taxPayer?.primaryPerson}
            control={control}
          />
          <LabeledCheckbox
            label="Check if you are a dependent"
            control={control}
            defaultValue={taxPayer?.primaryPerson?.isTaxpayerDependent ?? false}
            name="isTaxpayerDependent"
          />
          <AddressFields
            register={register}
            control={control}
            errors={errors.address}
            address={taxPayer?.primaryPerson?.address}
            checkboxText="Do you have a foreign address?"
            isForeignCountry={isForeignCountry}
          ></AddressFields>
          {navButtons}
        </form>
      }
    </PagerContext.Consumer>
  )
}
