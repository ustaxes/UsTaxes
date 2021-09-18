import { ReactElement, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
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
  TaxPayer
} from 'ustaxes/redux/data'
import { PersonFields } from './PersonFields'
import { usePager } from 'ustaxes/components/pager'
import { LabeledCheckbox, USStateDropDown } from 'ustaxes/components/input'
import AddressFields from './Address'
import { Grid } from '@material-ui/core'
import _ from 'lodash'

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

  const newTpForm: TaxPayerUserForm = {
    ...defaultTaxpayerUserForm,
    ...(taxPayer.primaryPerson !== undefined
      ? {
          stateResidency:
            stateResidency[0]?.state ?? taxPayer.primaryPerson.address.state,
          ...asTaxPayerUserForm(taxPayer.primaryPerson)
        }
      : {})
  }

  const methods = useForm<TaxPayerUserForm>({
    defaultValues: newTpForm
  })

  const { handleSubmit, getValues, reset } = methods

  // Make sure form rerender is triggered
  // if the state was updated outside of this form
  const currentValues = { ...defaultTaxpayerUserForm, ...getValues() }
  useEffect(() => {
    if (!_.isEqual(currentValues, newTpForm)) {
      return reset(newTpForm)
    }
  })

  const onSubmit = (form: TaxPayerUserForm): void => {
    dispatch(savePrimaryPersonInfo(asPrimaryPerson(form)))
    dispatch(saveStateResidencyInfo({ state: form.stateResidency as State }))
    onAdvance()
  }

  const page = (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit)}>
      <h2>Primary Taxpayer Information</h2>
      <Grid container spacing={2}>
        <PersonFields />
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
