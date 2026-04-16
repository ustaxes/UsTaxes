import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import { Grid } from '@material-ui/core'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { useYearSelector } from 'ustaxes/redux/yearDispatch'
import {
  addBusiness,
  editBusiness,
  removeBusiness,
  setInfo
} from 'ustaxes/redux/actions'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Business, Information, Person, PersonRole } from 'ustaxes/core/data'
import {
  formatSSID,
  GenericLabeledDropdown,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import AddressFields from 'ustaxes/components/TaxPayer/Address'
import { usePager } from 'ustaxes/components/pager'
import { intentionallyFloat } from 'ustaxes/core/util'
import { YearsTaxesState } from 'ustaxes/redux'
import { useSelector as useReduxSelector } from 'react-redux'
import {
  toBusinessFromSelfEmployedIncome,
  toSelfEmployedIncome
} from 'ustaxes/core/selfEmployment'

interface BusinessForm {
  name: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  principalBusinessOrProfession: string
  businessCode: string
  ein: string
  income: {
    grossReceipts: string | number
    returnsAndAllowances: string | number
    otherIncome: string | number
  }
  expenses: {
    advertising: string | number
    carAndTruck: string | number
    commissions: string | number
    contractLabor: string | number
    depletion: string | number
    depreciation: string | number
    employeeBenefit: string | number
    insurance: string | number
    interestMortgage: string | number
    interestOther: string | number
    legalAndProfessional: string | number
    office: string | number
    pensionProfitSharing: string | number
    rentVehicles: string | number
    rentOther: string | number
    repairs: string | number
    supplies: string | number
    taxesAndLicenses: string | number
    travel: string | number
    meals: string | number
    utilities: string | number
    wages: string | number
  }
  otherExpenseType: string
  otherExpenseAmount: string | number
  homeOfficeDeduction: string | number
  address: Business['address']
  isForeignCountry: boolean
}

const expenseFieldConfigs: Array<{
  name: keyof BusinessForm['expenses']
  label: string
}> = [
  { name: 'advertising', label: 'Advertising (line 8)' },
  { name: 'carAndTruck', label: 'Car and truck expenses (line 9)' },
  { name: 'commissions', label: 'Commissions and fees (line 10)' },
  { name: 'contractLabor', label: 'Contract labor (line 11)' },
  { name: 'depletion', label: 'Depletion (line 12)' },
  { name: 'depreciation', label: 'Depreciation (line 13)' },
  { name: 'employeeBenefit', label: 'Employee benefit programs (line 14)' },
  { name: 'insurance', label: 'Insurance (line 15)' },
  { name: 'interestMortgage', label: 'Mortgage interest (line 16a)' },
  { name: 'interestOther', label: 'Other interest (line 16b)' },
  {
    name: 'legalAndProfessional',
    label: 'Legal and professional services (line 17)'
  },
  { name: 'office', label: 'Office expense (line 18)' },
  {
    name: 'pensionProfitSharing',
    label: 'Pension and profit-sharing plans (line 19)'
  },
  { name: 'rentVehicles', label: 'Rent or lease - vehicles (line 20a)' },
  {
    name: 'rentOther',
    label: 'Rent or lease - other business property (line 20b)'
  },
  { name: 'repairs', label: 'Repairs and maintenance (line 21)' },
  { name: 'supplies', label: 'Supplies (line 22)' },
  { name: 'taxesAndLicenses', label: 'Taxes and licenses (line 23)' },
  { name: 'travel', label: 'Travel (line 24a)' },
  { name: 'meals', label: 'Meals (line 24b)' },
  { name: 'utilities', label: 'Utilities (line 25)' },
  { name: 'wages', label: 'Wages (line 26)' }
]

const blankAmount = ''

const formatAmount = (value?: number): string =>
  value === undefined ? '' : value.toString()

const parseRequiredAmount = (value: string | number): number =>
  value === '' ? 0 : Number(value)

const parseOptionalAmount = (value: string | number): number | undefined =>
  value === '' ? undefined : Number(value)

const blankBusinessForm: BusinessForm = {
  name: '',
  personRole: PersonRole.PRIMARY,
  principalBusinessOrProfession: '',
  businessCode: '',
  ein: '',
  income: {
    grossReceipts: blankAmount,
    returnsAndAllowances: blankAmount,
    otherIncome: blankAmount
  },
  expenses: {
    advertising: blankAmount,
    carAndTruck: blankAmount,
    commissions: blankAmount,
    contractLabor: blankAmount,
    depletion: blankAmount,
    depreciation: blankAmount,
    employeeBenefit: blankAmount,
    insurance: blankAmount,
    interestMortgage: blankAmount,
    interestOther: blankAmount,
    legalAndProfessional: blankAmount,
    office: blankAmount,
    pensionProfitSharing: blankAmount,
    rentVehicles: blankAmount,
    rentOther: blankAmount,
    repairs: blankAmount,
    supplies: blankAmount,
    taxesAndLicenses: blankAmount,
    travel: blankAmount,
    meals: blankAmount,
    utilities: blankAmount,
    wages: blankAmount
  },
  otherExpenseType: '',
  otherExpenseAmount: blankAmount,
  homeOfficeDeduction: blankAmount,
  address: {
    address: '',
    city: '',
    aptNo: '',
    state: undefined,
    zip: undefined
  },
  isForeignCountry: false
}

const toUserInput = (
  business: Business,
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE = PersonRole.PRIMARY
): BusinessForm => ({
  ...blankBusinessForm,
  name: business.name,
  personRole,
  principalBusinessOrProfession: business.principalBusinessOrProfession ?? '',
  businessCode: business.businessCode ?? '',
  ein: business.ein ?? '',
  income: {
    grossReceipts: business.income.grossReceipts.toString(),
    returnsAndAllowances: business.income.returnsAndAllowances.toString(),
    otherIncome: formatAmount(business.income.otherIncome)
  },
  expenses: {
    advertising: formatAmount(business.expenses.advertising),
    carAndTruck: formatAmount(business.expenses.carAndTruck),
    commissions: formatAmount(business.expenses.commissions),
    contractLabor: formatAmount(business.expenses.contractLabor),
    depletion: formatAmount(business.expenses.depletion),
    depreciation: formatAmount(business.expenses.depreciation),
    employeeBenefit: formatAmount(business.expenses.employeeBenefit),
    insurance: formatAmount(business.expenses.insurance),
    interestMortgage: formatAmount(business.expenses.interestMortgage),
    interestOther: formatAmount(business.expenses.interestOther),
    legalAndProfessional: formatAmount(business.expenses.legalAndProfessional),
    office: formatAmount(business.expenses.office),
    pensionProfitSharing: formatAmount(business.expenses.pensionProfitSharing),
    rentVehicles: formatAmount(business.expenses.rentVehicles),
    rentOther: formatAmount(business.expenses.rentOther),
    repairs: formatAmount(business.expenses.repairs),
    supplies: formatAmount(business.expenses.supplies),
    taxesAndLicenses: formatAmount(business.expenses.taxesAndLicenses),
    travel: formatAmount(business.expenses.travel),
    meals: formatAmount(business.expenses.meals),
    utilities: formatAmount(business.expenses.utilities),
    wages: formatAmount(business.expenses.wages)
  },
  otherExpenseType: business.otherExpenseType ?? '',
  otherExpenseAmount: formatAmount(
    business.otherExpenseAmount ?? business.expenses.other
  ),
  homeOfficeDeduction: formatAmount(business.homeOfficeDeduction),
  address: business.address ?? blankBusinessForm.address,
  isForeignCountry: business.address?.foreignCountry !== undefined
})

const toBusiness = (formData: BusinessForm): Business => ({
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
  income: {
    grossReceipts: parseRequiredAmount(formData.income.grossReceipts),
    returnsAndAllowances: parseRequiredAmount(
      formData.income.returnsAndAllowances
    ),
    otherIncome: parseOptionalAmount(formData.income.otherIncome)
  },
  expenses: {
    advertising: parseOptionalAmount(formData.expenses.advertising),
    carAndTruck: parseOptionalAmount(formData.expenses.carAndTruck),
    commissions: parseOptionalAmount(formData.expenses.commissions),
    contractLabor: parseOptionalAmount(formData.expenses.contractLabor),
    depletion: parseOptionalAmount(formData.expenses.depletion),
    depreciation: parseOptionalAmount(formData.expenses.depreciation),
    employeeBenefit: parseOptionalAmount(formData.expenses.employeeBenefit),
    insurance: parseOptionalAmount(formData.expenses.insurance),
    interestMortgage: parseOptionalAmount(formData.expenses.interestMortgage),
    interestOther: parseOptionalAmount(formData.expenses.interestOther),
    legalAndProfessional: parseOptionalAmount(
      formData.expenses.legalAndProfessional
    ),
    office: parseOptionalAmount(formData.expenses.office),
    pensionProfitSharing: parseOptionalAmount(
      formData.expenses.pensionProfitSharing
    ),
    rentVehicles: parseOptionalAmount(formData.expenses.rentVehicles),
    rentOther: parseOptionalAmount(formData.expenses.rentOther),
    repairs: parseOptionalAmount(formData.expenses.repairs),
    supplies: parseOptionalAmount(formData.expenses.supplies),
    taxesAndLicenses: parseOptionalAmount(formData.expenses.taxesAndLicenses),
    travel: parseOptionalAmount(formData.expenses.travel),
    meals: parseOptionalAmount(formData.expenses.meals),
    utilities: parseOptionalAmount(formData.expenses.utilities),
    wages: parseOptionalAmount(formData.expenses.wages),
    other: parseOptionalAmount(formData.otherExpenseAmount)
  },
  otherExpenseType:
    formData.otherExpenseType.trim() === ''
      ? undefined
      : formData.otherExpenseType.trim(),
  otherExpenseAmount: parseOptionalAmount(formData.otherExpenseAmount),
  homeOfficeDeduction: parseOptionalAmount(formData.homeOfficeDeduction)
})

export default function BusinessInfo(): ReactElement {
  const dispatch = useDispatch()
  const information = useYearSelector((state) => state.information)
  const businesses = information.businesses ?? []
  const sources = useSelector((state: TaxesState) => state.information.sources)
  const { onAdvance, navButtons } = usePager()
  const activeYear = useReduxSelector(
    (state: YearsTaxesState) => state.activeYear
  )
  const isY2025 = activeYear === 'Y2025'
  const effectiveSelfEmployedIncome = information.selfEmployedIncome ?? []

  const effectiveBusinesses: Business[] =
    isY2025 && businesses.length === 0 && effectiveSelfEmployedIncome.length > 0
      ? effectiveSelfEmployedIncome.map((entry) =>
          toBusinessFromSelfEmployedIncome(entry)
        )
      : businesses

  const people: Person[] = [
    information.taxPayer.primaryPerson,
    information.taxPayer.spouse
  ].flatMap((person) => (person !== undefined ? [person as Person] : []))

  const syncY2025Businesses = (nextBusinesses: Business[]): void => {
    const nextInfo: Information = {
      ...information,
      businesses: nextBusinesses,
      selfEmployedIncome: nextBusinesses.map((business, index) =>
        toSelfEmployedIncome(
          business,
          effectiveSelfEmployedIncome[index]?.personRole ??
            (index < nextBusinesses.length - 1
              ? PersonRole.PRIMARY
              : blankBusinessForm.personRole)
        )
      )
    }
    dispatch(setInfo(nextInfo))
  }

  const syncY2025BusinessesWithForm = (
    nextBusinesses: Business[],
    formData: BusinessForm,
    editingIndex?: number
  ): void => {
    const nextInfo: Information = {
      ...information,
      businesses: nextBusinesses,
      selfEmployedIncome: nextBusinesses.map((business, index) => {
        const fallbackRole =
          effectiveSelfEmployedIncome[index]?.personRole ?? PersonRole.PRIMARY
        const personRole =
          editingIndex === index ||
          (editingIndex === undefined && index === nextBusinesses.length - 1)
            ? formData.personRole
            : fallbackRole

        return toSelfEmployedIncome(business, personRole)
      })
    }
    dispatch(setInfo(nextInfo))
  }

  const methods = useForm<BusinessForm>({
    defaultValues: blankBusinessForm
  })
  const { handleSubmit } = methods

  const onAddBusiness = (formData: BusinessForm): void => {
    const nextBusiness = toBusiness(formData)
    if (isY2025) {
      syncY2025BusinessesWithForm(
        [...effectiveBusinesses, nextBusiness],
        formData
      )
      return
    }
    dispatch(addBusiness(nextBusiness))
  }

  const onEditBusiness =
    (index: number) =>
    (formData: BusinessForm): void => {
      const nextBusiness = toBusiness(formData)
      if (isY2025) {
        const nextBusinesses = [...effectiveBusinesses]
        nextBusinesses.splice(index, 1, nextBusiness)
        syncY2025BusinessesWithForm(nextBusinesses, formData, index)
        return
      }
      dispatch(
        editBusiness({
          index,
          value: nextBusiness
        })
      )
    }

  const form = (
    <FormListContainer
      defaultValues={blankBusinessForm}
      onSubmitAdd={onAddBusiness}
      onSubmitEdit={onEditBusiness}
      items={effectiveBusinesses.map((b, index) =>
        toUserInput(b, effectiveSelfEmployedIncome[index]?.personRole)
      )}
      removeItem={(i) => {
        if (isY2025) {
          const nextBusinesses = [...effectiveBusinesses]
          nextBusinesses.splice(i, 1)
          syncY2025Businesses(nextBusinesses)
          return
        }
        dispatch(removeBusiness(i))
      }}
      primary={(b) => b.name || b.principalBusinessOrProfession}
      secondary={(b) => b.ein}
      sources={sources}
      sourcePath={['businesses']}
      sourceForNew="user"
    >
      <Grid container spacing={2}>
        <LabeledInput label="Business name" name="name" />
        {isY2025 && people.length > 1 ? (
          <GenericLabeledDropdown
            dropDownData={people}
            label="Business owner"
            required={true}
            valueMapping={(person: Person, index: number) =>
              [PersonRole.PRIMARY, PersonRole.SPOUSE][index]
            }
            name="personRole"
            keyMapping={(person: Person, index: number) => index}
            textMapping={(person) =>
              `${person.firstName} ${person.lastName} (${formatSSID(
                person.ssid
              )})`
            }
          />
        ) : undefined}
        <LabeledInput
          label="Principal business or profession (Line A)"
          name="principalBusinessOrProfession"
        />
        <LabeledInput label="Business code (Line B)" name="businessCode" />
        <LabeledInput
          label="Employer ID number (EIN)"
          name="ein"
          patternConfig={Patterns.ein}
          required={false}
        />
        <AddressFields
          checkboxText="Business has a foreign address?"
          allowForeignCountry={true}
        />
        <Grid item xs={12}>
          <h3>Income (Schedule C Part I)</h3>
          <p>
            Enter receipts and adjustments for this business. 1099-NEC amounts
            are already added automatically to Schedule C where applicable, so
            only enter additional business receipts here.
          </p>
        </Grid>
        <LabeledInput
          label="Gross receipts or sales (line 1)"
          name="income.grossReceipts"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Returns and allowances (line 2)"
          name="income.returnsAndAllowances"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Other income (line 6)"
          name="income.otherIncome"
          patternConfig={Patterns.currency}
          required={false}
        />
        <Grid item xs={12}>
          <h3>Expenses (Schedule C Part II)</h3>
        </Grid>
        {expenseFieldConfigs.map(({ name, label }) => (
          <LabeledInput
            key={name}
            label={label}
            name={`expenses.${name}`}
            patternConfig={Patterns.currency}
            required={false}
          />
        ))}
        <LabeledInput
          label="Other expense type"
          name="otherExpenseType"
          required={false}
        />
        <LabeledInput
          label="Other expenses (line 27a)"
          name="otherExpenseAmount"
          patternConfig={Patterns.currency}
          required={false}
        />
        <LabeledInput
          label="Home office deduction (line 30)"
          name="homeOfficeDeduction"
          patternConfig={Patterns.currency}
          required={false}
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
          <title>Schedule C / Business Income | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Business Income (Schedule C)</h2>
        <p>
          Enter the identifying details, income, and expenses for each sole
          proprietorship business.
        </p>
        {isY2025 ? (
          <p>
            For tax year 2025, this page also feeds the newer self-employment
            calculation model used by Schedule C, Schedule SE, and Form 7206.
          </p>
        ) : undefined}
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
