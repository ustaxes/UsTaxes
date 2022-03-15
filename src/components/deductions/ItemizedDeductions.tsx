import { ReactElement, ReactNode } from 'react'
import { Helmet } from 'react-helmet'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector, TaxesState } from 'ustaxes/redux'
import { setItemizedDeductions } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import { LabeledInput, LabeledCheckbox } from 'ustaxes/components/input'
import { ItemizedDeductions } from 'ustaxes/core/data'
import { Patterns } from 'ustaxes/components/Patterns'
import { Grid, Box } from '@mui/material'
import { Alert } from '@mui/material'

interface ItemizedDeductionUserInput {
  medicalAndDental: string | number
  stateAndLocalTaxes: string | number
  isSalesTax: boolean
  stateAndLocalRealEstateTaxes: string | number
  stateAndLocalPropertyTaxes: string | number
  interest8a: string | number
  interest8b: string | number
  interest8c: string | number
  interest8d: string | number
  investmentInterest: string | number
  charityCashCheck: string | number
  charityOther: string | number
}

const blankUserInput: ItemizedDeductionUserInput = {
  medicalAndDental: '',
  stateAndLocalTaxes: '',
  isSalesTax: false,
  stateAndLocalRealEstateTaxes: '',
  stateAndLocalPropertyTaxes: '',
  interest8a: '',
  interest8b: '',
  interest8c: '',
  interest8d: '',
  investmentInterest: '',
  charityCashCheck: '',
  charityOther: ''
}

const toUserInput = (f: ItemizedDeductions): ItemizedDeductionUserInput => ({
  ...blankUserInput,
  medicalAndDental: f.medicalAndDental,
  stateAndLocalTaxes: f.stateAndLocalTaxes,
  isSalesTax: f.isSalesTax,
  stateAndLocalRealEstateTaxes: f.stateAndLocalRealEstateTaxes,
  stateAndLocalPropertyTaxes: f.stateAndLocalPropertyTaxes,
  interest8a: f.interest8a,
  interest8b: f.interest8b,
  interest8c: f.interest8c,
  interest8d: f.interest8d,
  investmentInterest: f.investmentInterest,
  charityCashCheck: f.charityCashCheck,
  charityOther: f.charityOther
})

const toItemizedDeductions = (
  f: ItemizedDeductionUserInput
): ItemizedDeductions => {
  return {
    medicalAndDental: Number(f.medicalAndDental),
    stateAndLocalTaxes: Number(f.stateAndLocalTaxes),
    isSalesTax: f.isSalesTax,
    stateAndLocalPropertyTaxes: Number(f.stateAndLocalPropertyTaxes),
    stateAndLocalRealEstateTaxes: Number(f.stateAndLocalRealEstateTaxes),
    interest8a: Number(f.interest8a),
    interest8b: Number(f.interest8b),
    interest8c: Number(f.interest8c),
    interest8d: Number(f.interest8d),
    investmentInterest: Number(f.investmentInterest),
    charityCashCheck: Number(f.charityCashCheck),
    charityOther: Number(f.charityOther)
  }
}

export const ItemizedDeductionsInfo = (): ReactElement => {
  const itemizedDeductions: ItemizedDeductions | undefined = useSelector(
    (state: TaxesState) => {
      return state.information.itemizedDeductions
    }
  )

  const defaultValues: ItemizedDeductionUserInput = {
    ...blankUserInput,
    ...(itemizedDeductions !== undefined ? toUserInput(itemizedDeductions) : {})
  }

  const { onAdvance, navButtons } = usePager()

  const methods = useForm<ItemizedDeductionUserInput>({ defaultValues })
  const { handleSubmit, watch } = methods

  const dispatch = useDispatch()

  const onSubmit = (form: ItemizedDeductionUserInput): void => {
    dispatch(setItemizedDeductions(toItemizedDeductions(form)))
    onAdvance()
  }

  const charityCashCheck: string | number = watch('charityCashCheck')

  const charityWarning: ReactNode = (() => {
    if (Number(charityCashCheck || 0) > 0) {
      return (
        <div>
          <Box marginBottom={3}>
            <Alert className="inner" severity="warning">
              See Pub. 526 to figure the amount of your deduction if any of the
              following applies.
              <br />
              1. Your cash contributions or contributions of ordinary income
              property are more than 30% of the amount on Form 1040 or 1040-SR,
              line 11.
              <br />
              2. Your gifts of capital gain property are more than 20% of the
              amount on Form 1040 or 1040-SR, line 11.
              <br />
              3. You gave gifts of property that increased in value or gave
              gifts of the use of property.
            </Alert>
          </Box>
        </div>
      )
    }
  })()

  // Limit charity to $500
  const currencyMax500Pattern = Object.assign({}, Patterns.currency)
  currencyMax500Pattern.max = 500

  const form: ReactElement | undefined = (
    <div>
      <p>Medical and Dental Expenses</p>
      <Grid container spacing={2}>
        <LabeledInput
          label="Medical and Dental Expenses"
          patternConfig={Patterns.currency}
          name="medicalAndDental"
          required={false}
        />
      </Grid>
      <p>Taxes You Paid</p>
      <Grid container spacing={2}>
        <LabeledInput
          label="State and Local Taxes"
          patternConfig={Patterns.currency}
          name="stateAndLocalTaxes"
          required={false}
        />
        <LabeledCheckbox
          label=" If you elect to include general sales taxes instead of income taxes, check this box"
          name="isSalesTax"
        />
        <LabeledInput
          label="State and Local Real Estate Taxes"
          patternConfig={Patterns.currency}
          name="stateAndLocalRealEstateTaxes"
          required={false}
        />
        <LabeledInput
          label="State and Local Personal Property Taxes"
          patternConfig={Patterns.currency}
          name="stateAndLocalPropertyTaxes"
          required={false}
        />
      </Grid>
      <p>Interest You Paid</p>
      <Grid container spacing={2}>
        <LabeledInput
          label="Home mortgage interest and points reported to you on Form 1098"
          patternConfig={Patterns.currency}
          name="interest8a"
          required={false}
        />
        <LabeledInput
          label="Home mortgage interest not reported to you on Form 1098"
          patternConfig={Patterns.currency}
          name="interest8b"
          required={false}
        />
        <LabeledInput
          label="Points not reported to you on Form 1098"
          patternConfig={Patterns.currency}
          name="interest8c"
          required={false}
        />
        <LabeledInput
          label="Mortgage insurance premiums"
          patternConfig={Patterns.currency}
          name="interest8d"
          required={false}
        />
        <LabeledInput
          label="Investment interest"
          patternConfig={Patterns.currency}
          name="investmentInterest"
          required={false}
        />
      </Grid>
      <p>Gifts To Charity</p>
      <Grid container spacing={2}>
        <LabeledInput
          label="Gifts by Cash or Check"
          patternConfig={Patterns.currency}
          name="charityCashCheck"
          required={false}
        />
        {charityWarning}
        <LabeledInput
          label="Other than Cash or Check (Limit $500)"
          patternConfig={currencyMax500Pattern}
          name="charityOther"
          required={false}
        />
      </Grid>
    </div>
  )

  return (
    <form tabIndex={-1} onSubmit={handleSubmit(onSubmit)}>
      <p>
        If you do not wish to itemize, you can skip this form. The itemized
        deductions will only be used if they result in a higher deduction than
        the standard deduction.
      </p>
      <FormProvider {...methods}>
        <Helmet>
          <title>
            Itemized Deduction Information | Deductions | UsTaxes.org
          </title>
        </Helmet>
        <h2>Itemized Deduction Information</h2>
        {form}
        {navButtons}
      </FormProvider>
    </form>
  )
}

export default ItemizedDeductionsInfo
