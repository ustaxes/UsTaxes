import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { useYearSelector, useYearDispatch } from 'ustaxes/redux/yearDispatch'
import { FormProvider, useForm } from 'react-hook-form'
import { usePager } from 'ustaxes/components/pager'
import {
  Ira,
  IraPlanType,
  IraPlanTypeTexts,
  Person,
  PersonRole
} from 'ustaxes/core/data'

import {
  Currency,
  LabeledInput,
  GenericLabeledDropdown,
  formatSSID,
  LabeledCheckbox,
  boxLabel
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { Work } from '@material-ui/icons'
import { TaxesState } from 'ustaxes/redux'
import { addIRA, editIRA, removeIRA } from 'ustaxes/redux/actions'
import { intentionallyFloat } from 'ustaxes/core/util'

interface IraUserInput {
  payer: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  // fields about distributions from form 1099-R
  grossDistribution?: string // 1099-R box 1
  taxableAmount?: string // 1099-R box 2a
  taxableAmountNotDetermined?: boolean // 1099-R box 2b
  totalDistribution?: boolean // 1099-R box 2b
  federalIncomeTaxWithheld?: string // 1099-R box 4
  planType: IraPlanType
  // fields about contributions from form 5498
  contributions?: string // 5498 box 1
  rolloverContributions?: string // 5498 box 2
  rothIraConversion?: string // 5498 box 3
  recharacterizedContributions?: string // 5498 box 4
  requiredMinimumDistributions?: string // 5498 box 12b
  lateContributions?: string // 5498 box 13a
  repayments?: string // 5498 box 14a
}

const blankUserInput: IraUserInput = {
  payer: '',
  personRole: PersonRole.PRIMARY,
  grossDistribution: '',
  taxableAmount: '',
  taxableAmountNotDetermined: false,
  totalDistribution: false,
  federalIncomeTaxWithheld: '',
  planType: IraPlanType.IRA,
  // fields about contributions from form 5498
  contributions: '',
  rolloverContributions: '',
  rothIraConversion: '',
  recharacterizedContributions: '',
  requiredMinimumDistributions: '',
  lateContributions: '',
  repayments: ''
}

const toIra = (formData: IraUserInput): Ira => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  payer: formData.payer,
  personRole: formData.personRole,
  grossDistribution: Number(formData.grossDistribution),
  taxableAmount: Number(formData.taxableAmount),
  taxableAmountNotDetermined: formData.taxableAmountNotDetermined ?? false,
  totalDistribution: formData.totalDistribution ?? false,
  federalIncomeTaxWithheld: Number(formData.federalIncomeTaxWithheld),
  planType: formData.planType,
  // fields about contributions from form 5498
  contributions: Number(formData.contributions),
  rolloverContributions: Number(formData.rolloverContributions),
  rothIraConversion: Number(formData.rothIraConversion),
  recharacterizedContributions: Number(formData.recharacterizedContributions),
  requiredMinimumDistributions: Number(formData.requiredMinimumDistributions),
  lateContributions: Number(formData.lateContributions),
  repayments: Number(formData.repayments)
})

const toIraUserInput = (data: Ira): IraUserInput => ({
  ...blankUserInput,
  ...data,

  grossDistribution: data.grossDistribution.toString(),
  taxableAmount: data.taxableAmount.toString(),
  federalIncomeTaxWithheld: data.federalIncomeTaxWithheld.toString(),
  // fields about contributions from form 5498
  contributions: data.contributions.toString(),
  rolloverContributions: data.rolloverContributions.toString(),
  rothIraConversion: data.rothIraConversion.toString(),
  recharacterizedContributions: data.recharacterizedContributions.toString(),
  requiredMinimumDistributions: data.requiredMinimumDistributions.toString(),
  lateContributions: data.lateContributions.toString(),
  repayments: data.repayments.toString()
})

export default function IRA(): ReactElement {
  const defaultValues = blankUserInput
  const ira = useYearSelector(
    (state: TaxesState) => state.information.individualRetirementArrangements
  )

  const people: Person[] = useYearSelector((state: TaxesState) => [
    state.information.taxPayer.primaryPerson,
    state.information.taxPayer.spouse
  ])
    .filter((p) => p !== undefined)
    .map((p) => p as Person)

  const dispatch = useYearDispatch()

  const methods = useForm<IraUserInput>({ defaultValues })
  const { handleSubmit } = methods

  const { navButtons, onAdvance } = usePager()

  const onSubmitAdd = (formData: IraUserInput): void => {
    dispatch(addIRA(toIra(formData)))
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: IraUserInput): void => {
      dispatch(editIRA({ index, value: toIra(formData) }))
    }

  const hsaBlock = (
    <FormListContainer<IraUserInput>
      defaultValues={defaultValues}
      items={ira.map((a) => toIraUserInput(a))}
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      removeItem={(i) => dispatch(removeIRA(i))}
      icon={() => <Work />}
      primary={(ira: IraUserInput) => ira.payer}
      secondary={(ira: IraUserInput) => (
        <span>
          {IraPlanTypeTexts[ira.planType]}
          <br />
          gross distribution: <Currency value={toIra(ira).grossDistribution} />
          <br />
          contribution: <Currency value={toIra(ira).contributions} />
          <br />
        </span>
      )}
    >
      <Grid container spacing={2}>
        <LabeledInput<IraUserInput>
          name="payer"
          label="Payer for this account"
          patternConfig={Patterns.plain}
          sizes={{ xs: 12, lg: 12 }}
        />
        <GenericLabeledDropdown<IraPlanType, IraUserInput>
          label="IRA Type"
          dropDownData={Object.values(IraPlanType)}
          valueMapping={(x) => x}
          keyMapping={(_, i) => i}
          textMapping={(status) => IraPlanTypeTexts[status]}
          name="planType"
        />
        <GenericLabeledDropdown<Person, IraUserInput>
          dropDownData={people}
          label="Recipient"
          valueMapping={(p: Person, i: number) =>
            [PersonRole.PRIMARY, PersonRole.SPOUSE][i]
          }
          name="personRole"
          keyMapping={(p: Person, i: number) => i}
          textMapping={(p: Person) =>
            `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`
          }
        />
      </Grid>
      <h3>Contributions (Form 5498)</h3>
      <p>
        If you made no contributions you may not have received form 5498 for
        this account and may leave these fields blank.
      </p>
      <Grid container spacing={2}>
        <LabeledInput
          name="contributions"
          label="Contributions"
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="rolloverContributions"
          label={boxLabel('2', 'Rollover contributions')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="rothIraConversion"
          label={boxLabel('3', 'Amount converted to Roth IRA')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="recharacterizedContributions"
          label={boxLabel('4', 'Recharacterized contributions')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="requiredMinimumDistributions"
          label={boxLabel('12b', 'Required minimum distributions')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="lateContributions"
          label={boxLabel('13a', 'Late contributions')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="repayments"
          label={boxLabel('14a', 'Repayments to this account')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
      </Grid>
      <h3>Distributions (Form 1099-R)</h3>
      <p>
        If you have no distributions from this account then you may not have
        received form 1099-R and may leave these fields blank.
      </p>

      <Grid container spacing={2}>
        <LabeledInput
          name="grossDistribution"
          label={boxLabel('1', 'Total distributions')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="taxableAmount"
          label={boxLabel(
            '2a',
            'This part of the distribution is generally taxable'
          )}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledInput
          name="federalIncomeTaxWithheld"
          label={boxLabel('4a', 'Federal income tax withheld')}
          patternConfig={Patterns.currency}
          required={false}
          sizes={{ xs: 12, lg: 6 }}
        />
        <LabeledCheckbox
          name="taxableAmountNotDetermined"
          label="Check if the payer was unable to determine the taxable amount"
        />
        <LabeledCheckbox
          name="totalDistribution"
          label="This distribution closed out your account"
        />
      </Grid>
    </FormListContainer>
  )

  const form: ReactElement = <>{hsaBlock}</>

  return (
    <FormProvider {...methods}>
      <form
        tabIndex={-1}
        onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
      >
        <Helmet>
          <title>
            Individual Retirement Arrangements (IRA) | Savings Accounts |
            UsTaxes.org
          </title>
        </Helmet>
        <h2>Individual Retirement Arrangements (IRA)</h2>
        {form}
        {navButtons}
      </form>
    </FormProvider>
  )
}
