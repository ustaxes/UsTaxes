import { ReactElement } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet'
import { Message, useForm, useWatch, FormProvider } from 'react-hook-form'
import {
  addProperty,
  editProperty,
  removeProperty
} from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import {
  Property,
  Address,
  PropertyExpenseType,
  PropertyExpenseTypeName,
  TaxesState,
  PropertyType,
  PropertyTypeName
} from 'ustaxes/redux/data'
import AddressFields from 'ustaxes/components/TaxPayer/Address'
import {
  Currency,
  GenericLabeledDropdown,
  LabeledCheckbox,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { daysInYear, enumKeys } from '../../util'
import { HouseOutlined } from '@material-ui/icons'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { CURRENT_YEAR } from 'ustaxes/data/federal'
import { If } from 'react-if'
import _ from 'lodash'

interface PropertyAddForm {
  address?: Address
  rentReceived?: number
  rentalDays?: number
  personalUseDays?: number
  qualifiedJointVenture: boolean
  propertyType?: PropertyTypeName
  otherPropertyType?: string
  expenses: Partial<{ [K in PropertyExpenseTypeName]: number }>
  otherExpenseType?: string
}

const blankAddForm: PropertyAddForm = {
  qualifiedJointVenture: false,
  expenses: {}
}

const displayExpense = (k: PropertyExpenseType): string => {
  const lookup = {
    [PropertyExpenseType.advertising]: 'Advertising',
    [PropertyExpenseType.auto]: 'Auto and travel',
    [PropertyExpenseType.cleaning]: 'Cleaning and maintenance',
    [PropertyExpenseType.commissions]: 'Commissions',
    [PropertyExpenseType.insurance]: 'Insurance',
    [PropertyExpenseType.legal]: 'Legal and other professional fees',
    [PropertyExpenseType.management]: 'Management fees',
    [PropertyExpenseType.mortgage]: 'Mortgage interest paid to banks, etc',
    [PropertyExpenseType.otherInterest]: 'Other interest',
    [PropertyExpenseType.repairs]: 'Repairs',
    [PropertyExpenseType.supplies]: 'Supplies',
    [PropertyExpenseType.taxes]: 'Taxes',
    [PropertyExpenseType.utilities]: 'Utilities',
    [PropertyExpenseType.depreciation]: 'Depreciation expense or depletion',
    [PropertyExpenseType.other]: 'Other'
  }
  return lookup[k]
}

const displayPropertyType = (k: PropertyType): string => {
  const lookup = {
    [PropertyType.singleFamily]: 'Single family',
    [PropertyType.multiFamily]: 'Multifamily',
    [PropertyType.vacation]: 'Vacation',
    [PropertyType.commercial]: 'Commercial',
    [PropertyType.land]: 'Land',
    [PropertyType.selfRental]: 'Self rental',
    [PropertyType.other]: 'Other'
  }
  return lookup[k]
}

const toProperty = (formData: PropertyAddForm): Property => {
  const {
    address,
    rentReceived,
    rentalDays,
    qualifiedJointVenture,
    propertyType,
    otherPropertyType,
    personalUseDays,
    expenses,
    otherExpenseType
  } = formData

  if (address === undefined || propertyType === undefined) {
    throw new Error('Validation failed')
  }

  const newExpenses: Partial<{ [K in PropertyExpenseTypeName]: number }> =
    Object.fromEntries(
      enumKeys(PropertyExpenseType)
        .filter((e) => e in expenses && (expenses[e] as number) > 0)
        .map((e) => [e, Number(expenses[e])])
    )

  return {
    address,
    rentalDays: Number(rentalDays),
    qualifiedJointVenture,
    rentReceived: Number(rentReceived),
    personalUseDays: Number(personalUseDays),
    propertyType,
    otherPropertyType,
    expenses: newExpenses,
    otherExpenseType
  }
}

const toUserInput = (property: Property): PropertyAddForm => {
  return {
    ...blankAddForm,
    address: property.address,
    rentReceived: property.rentReceived,
    rentalDays: property.rentalDays,
    personalUseDays: property.personalUseDays,
    qualifiedJointVenture: property.qualifiedJointVenture,
    propertyType: property.propertyType,
    otherPropertyType: property.otherPropertyType,
    expenses: property.expenses,
    otherExpenseType: property.otherExpenseType
  }
}

export default function RealEstate(): ReactElement {
  const methods = useForm<PropertyAddForm>()
  const { control, getValues } = methods
  const dispatch = useDispatch()

  const { onAdvance, navButtons } = usePager()

  const properties: Property[] = useSelector(
    (state: TaxesState) => state.information.realEstate
  )

  const propertyType = useWatch({
    control,
    name: 'propertyType'
  })

  const otherExpensesEntered: number | undefined = useWatch({
    control,
    name: 'expenses.other'
  })

  const validateDays = (n: number, other: number): Message | true => {
    const days = daysInYear(CURRENT_YEAR)
    return n + other <= days ? true : `Total use days must be less than ${days}`
  }

  const validatePersonal = (n: number): Message | true =>
    validateDays(n, Number(getValues().rentalDays ?? 0))

  const validateRental = (n: number): Message | true =>
    validateDays(n, Number(getValues().personalUseDays ?? 0))

  const deleteProperty = (n: number): void => {
    dispatch(removeProperty(n))
  }

  const onAddProperty = (formData: PropertyAddForm): void => {
    dispatch(addProperty(toProperty(formData)))
  }

  const onEditProperty =
    (index: number) =>
    (formData: PropertyAddForm): void => {
      dispatch(editProperty({ value: toProperty(formData), index }))
    }

  const expenseFields: ReactElement[] = enumKeys(PropertyExpenseType).map(
    (k, i) => (
      <LabeledInput
        key={i}
        label={displayExpense(PropertyExpenseType[k])}
        name={`expenses.${k.toString()}`}
        patternConfig={Patterns.currency}
      />
    )
  )

  const otherExpenseDescription = (() => {
    if (otherExpensesEntered !== 0) {
      return (
        <LabeledInput
          key={enumKeys(PropertyExpenseType).length}
          label="Other description"
          name="otherExpenseType"
          required={true}
        />
      )
    }
  })()

  const form = (
    <FormListContainer
      items={properties.map((a) => toUserInput(a))}
      icon={() => <HouseOutlined />}
      primary={(p) => toProperty(p).address.address}
      secondary={(p) => <Currency value={toProperty(p).rentReceived} />}
      onSubmitAdd={onAddProperty}
      onSubmitEdit={onEditProperty}
      removeItem={(i) => deleteProperty(i)}
    >
      <h3>Property Location</h3>
      <Grid container spacing={2}>
        <AddressFields
          autofocus={true}
          checkboxText="Does the property have a foreign address"
          allowForeignCountry={false}
        />
        <GenericLabeledDropdown
          dropDownData={enumKeys(PropertyType)}
          label="Property type"
          textMapping={(t) => displayPropertyType(PropertyType[t])}
          keyMapping={(_, n) => n}
          name="propertyType"
          valueMapping={(n) => n}
        />
        <If condition={propertyType === 'other'}>
          <LabeledInput
            name="otherPropertyType"
            label="Short property type description"
            required={true}
          />
        </If>
      </Grid>
      <h3>Use</h3>
      <Grid container spacing={2}>
        <LabeledInput
          name="rentalDays"
          rules={{ validate: (n: string) => validateRental(Number(n)) }}
          label="Number of days in the year used for rental"
          patternConfig={Patterns.numDays}
        />
        <LabeledInput
          name="personalUseDays"
          rules={{ validate: (n: string) => validatePersonal(Number(n)) }}
          label="Number of days in the year for personal use"
          patternConfig={Patterns.numDays}
        />
        <LabeledCheckbox
          name="qualifiedJointVenture"
          label="Is this a qualified joint venture"
        />
      </Grid>
      <h3>Property Financials</h3>
      <h4>Income</h4>
      <Grid container spacing={2}>
        <LabeledInput
          name="rentReceived"
          label="Rent received"
          patternConfig={Patterns.currency}
        />
      </Grid>
      <h4>Expenses</h4>
      <Grid container spacing={2}>
        {_.chain([...expenseFields, otherExpenseDescription])
          .chunk(2)
          .map((segment, i) =>
            segment.map((item, k) => (
              <Grid item key={`${i}-${k}`} xs={12} sm={6}>
                {item}
              </Grid>
            ))
          )
          .value()}
      </Grid>
    </FormListContainer>
  )

  return (
    <form tabIndex={-1} onSubmit={onAdvance}>
      <Helmet>
        <title>Real Estate | Income | UsTaxes.org</title>
      </Helmet>
      <h2>Properties</h2>
      <FormProvider {...methods}>{form}</FormProvider>
      {navButtons}
    </form>
  )
}
