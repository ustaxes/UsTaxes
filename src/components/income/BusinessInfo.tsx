import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import { Grid } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { useYearSelector } from 'ustaxes/redux/yearDispatch'
import {
  addBusiness,
  editBusiness,
  removeBusiness
} from 'ustaxes/redux/actions'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Business } from 'ustaxes/core/data'
import { LabeledInput } from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import AddressFields from 'ustaxes/components/TaxPayer/Address'
import { usePager } from 'ustaxes/components/pager'
import { intentionallyFloat } from 'ustaxes/core/util'

interface BusinessForm {
  name: string
  principalBusinessOrProfession: string
  businessCode: string
  ein: string
  address: Business['address']
  isForeignCountry: boolean
}

const blankBusinessForm: BusinessForm = {
  name: '',
  principalBusinessOrProfession: '',
  businessCode: '',
  ein: '',
  address: {
    address: '',
    city: '',
    aptNo: '',
    state: undefined,
    zip: undefined
  },
  isForeignCountry: false
}

const toUserInput = (business: Business): BusinessForm => ({
  ...blankBusinessForm,
  name: business.name,
  principalBusinessOrProfession: business.principalBusinessOrProfession ?? '',
  businessCode: business.businessCode ?? '',
  ein: business.ein ?? '',
  address: business.address ?? blankBusinessForm.address,
  isForeignCountry: business.address?.foreignCountry !== undefined
})

const toBusiness = (formData: BusinessForm, existing?: Business): Business => ({
  name: formData.name,
  principalBusinessOrProfession:
    formData.principalBusinessOrProfession.trim() === ''
      ? undefined
      : formData.principalBusinessOrProfession.trim(),
  businessCode:
    formData.businessCode.trim() === ''
      ? undefined
      : formData.businessCode.trim(),
  ein: formData.ein.trim() === '' ? undefined : formData.ein.trim(),
  address: formData.address,
  income: existing?.income ?? {
    grossReceipts: 0,
    returnsAndAllowances: 0,
    otherIncome: 0
  },
  expenses: existing?.expenses ?? {},
  otherExpenseType: existing?.otherExpenseType,
  otherExpenseAmount: existing?.otherExpenseAmount,
  homeOfficeDeduction: existing?.homeOfficeDeduction
})

export default function BusinessInfo(): ReactElement {
  const dispatch = useDispatch()
  const businesses = useYearSelector(
    (state) => state.information.businesses ?? []
  )
  const sources = useSelector((state: TaxesState) => state.information.sources)
  const { onAdvance, navButtons } = usePager()

  const methods = useForm<BusinessForm>({
    defaultValues: blankBusinessForm
  })
  const { handleSubmit } = methods

  const onAddBusiness = (formData: BusinessForm): void => {
    dispatch(addBusiness(toBusiness(formData)))
  }

  const onEditBusiness =
    (index: number) =>
    (formData: BusinessForm): void => {
      dispatch(
        editBusiness({
          index,
          value: toBusiness(formData, businesses[index])
        })
      )
    }

  const form = (
    <FormListContainer
      defaultValues={blankBusinessForm}
      onSubmitAdd={onAddBusiness}
      onSubmitEdit={onEditBusiness}
      items={businesses.map((b) => toUserInput(b))}
      removeItem={(i) => dispatch(removeBusiness(i))}
      primary={(b) => b.name || b.principalBusinessOrProfession}
      secondary={(b) => b.ein}
      sources={sources}
      sourcePath={['businesses']}
      sourceForNew="user"
    >
      <Grid container spacing={2}>
        <LabeledInput label="Business name" name="name" />
        <LabeledInput
          label="Principal business or profession (Line A)"
          name="principalBusinessOrProfession"
        />
        <LabeledInput label="Business code (Line B)" name="businessCode" />
        <LabeledInput
          label="Employer ID number (EIN)"
          name="ein"
          patternConfig={Patterns.ein}
        />
        <AddressFields
          checkboxText="Business has a foreign address?"
          allowForeignCountry={true}
        />
      </Grid>
    </FormListContainer>
  )

  return (
    <FormProvider {...methods}>
      <form
        tabIndex={-1}
        onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
      >
        <Helmet>
          <title>Business Details | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Business Details (Schedule C)</h2>
        <p>Enter details for your sole proprietorship business.</p>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
