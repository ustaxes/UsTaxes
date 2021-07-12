import React, { Fragment, ReactElement, useState } from 'react'
import { Message, useForm, useWatch, FormProvider } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { addProperty, editProperty, removeProperty } from '../../redux/actions'
import { PagerContext } from '../pager'
import { Property, Address, PropertyExpenseType, PropertyExpenseTypeName, TaxesState, PropertyType, PropertyTypeName } from '../../redux/data'
import AddressFields from '../TaxPayer/Address'
import { Currency, GenericLabeledDropdown, LabeledCheckbox, LabeledInput } from '../input'
import { Patterns } from '../Patterns'
import { daysInYear, enumKeys, segments } from '../../util'
import { HouseOutlined } from '@material-ui/icons'
import { FormListContainer } from '../FormContainer'
import { Grid } from '@material-ui/core'
import { CURRENT_YEAR } from '../../data/federal'

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

  const newExpenses: Partial<{[K in PropertyExpenseTypeName]: number}> = (
    Object.fromEntries(
      enumKeys(PropertyExpenseType)
        .filter((e) => (e in expenses) && (expenses[e] as number > 0))
        .map((e) => ([e, Number(expenses[e])]))
    )
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

export default function RealEstate (): ReactElement {
  const methods = useForm<PropertyAddForm>()
  const { control, formState: { errors }, getValues, handleSubmit, reset } = methods
  const dispatch = useDispatch()

  const properties: Property[] = useSelector((state: TaxesState) => state.information.realEstate)
  const [editing, setEditing] = useState<number | undefined>(undefined)

  const defaultValues: PropertyAddForm | undefined = (() => {
    if (editing !== undefined) {
      return toUserInput(properties[editing])
    }
  })()

  const propertyType = useWatch({
    control,
    name: 'propertyType',
    defaultValue: defaultValues?.propertyType
  })

  const otherExpensesEntered = useWatch({
    control,
    name: 'expenses.other',
    defaultValue: defaultValues?.expenses.other
  })

  const validateDays = (n: number, other: number): Message | true => {
    const days = daysInYear(CURRENT_YEAR)
    return (n + other) <= days ? true : `Total use days must be less than ${days}`
  }

  const validatePersonal = (n: number): Message | true =>
    validateDays(n, Number(getValues().rentalDays ?? 0))

  const validateRental = (n: number): Message | true =>
    validateDays(n, Number(getValues().personalUseDays ?? 0))

  const clear = (): void => {
    reset()
    setEditing(undefined)
  }

  const deleteProperty = (n: number): void => {
    dispatch(removeProperty(n))
    clear()
  }

  const onAddProperty = (onSuccess: () => void) => (formData: PropertyAddForm): void => {
    dispatch((() => {
      if (editing !== undefined) {
        return editProperty({ value: toProperty(formData), index: editing })
      } else {
        return addProperty(toProperty(formData))
      }
    })())
    clear()
    onSuccess()
  }

  const expenseFields: ReactElement[] = (
    enumKeys(PropertyExpenseType).map((k, i) =>
      <LabeledInput
        key={i}
        label={displayExpense(PropertyExpenseType[k])}
        name={`expenses.${k.toString()}`}
        patternConfig={Patterns.currency}
      />
    )
  )

  const otherExpenseDescription = (() => {
    if (defaultValues?.expenses.other !== undefined || otherExpensesEntered !== 0) {
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
    <FormListContainer<Property>
      items={properties}
      icon={() => <HouseOutlined />}
      primary={(p) => p.address.address}
      secondary={(p) => <Currency value={p.rentReceived} /> }
      editItem={(i) => setEditing(i)}
      onDone={(onSuccess) => handleSubmit(onAddProperty(onSuccess))}
      removeItem={(i) => deleteProperty(i)}
      onCancel={clear}
    >
      <h4>Property location</h4>
      <AddressFields
        errors={errors.address}
        checkboxText="Does the property have a foreign address"
        allowForeignCountry={false}
      />
      <GenericLabeledDropdown
        dropDownData={enumKeys(PropertyType)}
        label="Property type"
        error={errors.propertyType}
        textMapping={(t) => displayPropertyType(PropertyType[t])}
        keyMapping={(_, n) => n}
        name="propertyType"
        valueMapping={(n) => n}
      />
      {(() => {
        if ([propertyType, defaultValues?.propertyType].includes('other')) {
          return (
            <LabeledInput
              name="otherPropertyType"
              label="Short property type description"
              error={errors.otherPropertyType}
              required={true}
            />
          )
        }
      })()}
      <h4>Use</h4>
      <LabeledInput
        name="rentalDays"
        rules={{ validate: (n: String) => validateRental(Number(n)) }}
        label="Number of days in the year used for rental"
        patternConfig={Patterns.numDays}
        error={errors.rentalDays}
      />
      <LabeledInput
        name="personalUseDays"
        rules={{ validate: (n: String) => validatePersonal(Number(n)) }}
        label="Number of days in the year for personal use"
        patternConfig={Patterns.numDays}
        error={errors.personalUseDays}
      />
      <LabeledCheckbox
        name="qualifiedJointVenture"
        label="Is this a qualified joint venture"
      />
      <h4>Property Financials</h4>
      <h5>Income</h5>
      <LabeledInput
        name="rentReceived"
        label="Rent received"
        patternConfig={Patterns.currency}
        error={errors.rentReceived}
      />
      <h5>Expenses</h5>
      <Grid container spacing={3} direction="row" justify="flex-start">
        {(() => {
          // Layout expense fields in two columns
          return (
            segments(2, [...expenseFields, otherExpenseDescription])
              .map((segment, i) =>
                <Grid item key={i} lg={6}>
                  {
                    segment.map((item, k) =>
                      <Fragment key={`${i}-${k}`}>
                        {item}
                      </Fragment>
                    )
                  }
                </Grid>
              )
          )
        })()}
      </Grid>
    </FormListContainer>
  )

  return (
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <form onSubmit={onAdvance}>
          <h2>Properties</h2>
          <FormProvider {...methods}>
            {form}
          </FormProvider>
          { navButtons }
        </form>
      }
    </PagerContext.Consumer>
  )
}
