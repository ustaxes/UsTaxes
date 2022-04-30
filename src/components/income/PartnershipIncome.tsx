import { ReactElement, ReactNode } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import { TaxesState, useSelector, useDispatch } from 'ustaxes/redux'
import {
  addScheduleK1Form1065,
  editScheduleK1Form1065,
  removeScheduleK1Form1065
} from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import {
  boxLabel,
  LabeledInput,
  GenericLabeledDropdown,
  formatSSID,
  LabeledCheckbox,
  formatEIN
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid, Box } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { Business } from '@material-ui/icons'
import {
  ScheduleK1Form1065,
  FilingStatus,
  Information,
  Person,
  PersonRole,
  PrimaryPerson,
  Spouse
} from 'ustaxes/core/data'
import { intentionallyFloat } from 'ustaxes/core/util'

interface ScheduleK1Form1065UserInput {
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  partnershipName: string
  partnershipEin: string
  partnerOrSCorp: 'P' | 'S'
  isForeign: boolean
  isPassive: boolean
  ordinaryBusinessIncome: string
  interestIncome: string
  guaranteedPaymentsForServices: string
  guaranteedPaymentsForCapital: string
  selfEmploymentEarningsA: string
  selfEmploymentEarningsB: string
  selfEmploymentEarningsC: string
  distributionsCodeAAmount: string
  section199AQBI: string
}

const blankUserInput: ScheduleK1Form1065UserInput = {
  personRole: PersonRole.PRIMARY,
  partnershipName: '',
  partnershipEin: '',
  partnerOrSCorp: 'P',
  isForeign: false,
  isPassive: false,
  ordinaryBusinessIncome: '',
  interestIncome: '',
  guaranteedPaymentsForServices: '',
  guaranteedPaymentsForCapital: '',
  selfEmploymentEarningsA: '',
  selfEmploymentEarningsB: '',
  selfEmploymentEarningsC: '',
  distributionsCodeAAmount: '',
  section199AQBI: ''
}

const toUserInput = (k1: ScheduleK1Form1065): ScheduleK1Form1065UserInput => ({
  ...blankUserInput,
  personRole: k1.personRole,
  partnershipName: k1.partnershipName.toString(),
  partnershipEin: k1.partnershipEin.toString(),
  partnerOrSCorp: k1.partnerOrSCorp,
  isForeign: k1.isForeign,
  isPassive: k1.isPassive,
  ordinaryBusinessIncome: k1.ordinaryBusinessIncome.toString(),
  interestIncome: k1.interestIncome.toString(),
  guaranteedPaymentsForServices: k1.guaranteedPaymentsForServices.toString(),
  guaranteedPaymentsForCapital: k1.guaranteedPaymentsForCapital.toString(),
  selfEmploymentEarningsA: k1.selfEmploymentEarningsA.toString(),
  selfEmploymentEarningsB: k1.selfEmploymentEarningsB.toString(),
  selfEmploymentEarningsC: k1.selfEmploymentEarningsC.toString(),
  distributionsCodeAAmount: k1.distributionsCodeAAmount.toString(),
  section199AQBI: k1.section199AQBI.toString()
})

const toScheduleK1Form1065 = (
  input: ScheduleK1Form1065UserInput
): ScheduleK1Form1065 | undefined => {
  const {
    personRole,
    partnershipName,
    partnershipEin,
    partnerOrSCorp,
    isForeign,
    isPassive,
    ordinaryBusinessIncome,
    interestIncome,
    guaranteedPaymentsForServices,
    guaranteedPaymentsForCapital,
    selfEmploymentEarningsA,
    selfEmploymentEarningsB,
    selfEmploymentEarningsC,
    distributionsCodeAAmount,
    section199AQBI
  } = input
  if (partnershipName === '') {
    return undefined
  }
  return {
    personRole: personRole,
    partnershipName: partnershipName,
    partnershipEin: partnershipEin,
    partnerOrSCorp: partnerOrSCorp,
    isForeign: isForeign,
    isPassive: isPassive,
    ordinaryBusinessIncome: Number(ordinaryBusinessIncome),
    interestIncome: Number(interestIncome),
    guaranteedPaymentsForServices: Number(guaranteedPaymentsForServices),
    guaranteedPaymentsForCapital: Number(guaranteedPaymentsForCapital),
    selfEmploymentEarningsA: Number(selfEmploymentEarningsA),
    selfEmploymentEarningsB: Number(selfEmploymentEarningsB),
    selfEmploymentEarningsC: Number(selfEmploymentEarningsC),
    distributionsCodeAAmount: Number(distributionsCodeAAmount),
    section199AQBI: Number(section199AQBI)
  }
}

export const PartnershipIncome = (): ReactElement => {
  const information: Information = useSelector(
    (state: TaxesState) => state.information
  )
  const ScheduleK1Form1065s = information.scheduleK1Form1065s
  const spouseScheduleK1Form1065s = ScheduleK1Form1065s.filter(
    (k1) => k1.personRole === PersonRole.SPOUSE
  )

  const spouse: Spouse | undefined = information.taxPayer.spouse

  const primary: PrimaryPerson | undefined = information.taxPayer.primaryPerson

  const filingStatus: FilingStatus | undefined =
    information.taxPayer.filingStatus

  // People for employee selector
  const people: Person[] = [primary, spouse].flatMap((p) =>
    p !== undefined ? [p as Person] : []
  )

  const defaultValues = blankUserInput

  const methods = useForm<ScheduleK1Form1065UserInput>({ defaultValues })
  const { handleSubmit } = methods
  const dispatch = useDispatch()

  const { onAdvance, navButtons } = usePager()

  const onSubmitAdd = (formData: ScheduleK1Form1065UserInput): void => {
    const payload = toScheduleK1Form1065(formData)
    if (payload !== undefined) {
      dispatch(addScheduleK1Form1065(payload))
    }
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: ScheduleK1Form1065UserInput): void => {
      const payload = toScheduleK1Form1065(formData)
      if (payload !== undefined) {
        dispatch(editScheduleK1Form1065({ value: payload, index }))
      }
    }

  const form: ReactElement | undefined = (
    <FormListContainer<ScheduleK1Form1065UserInput>
      defaultValues={defaultValues}
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      items={ScheduleK1Form1065s.map((a) => toUserInput(a))}
      removeItem={(i) => dispatch(removeScheduleK1Form1065(i))}
      icon={() => <Business />}
      primary={(k1) => k1.partnershipName}
      secondary={(k1) => {
        const scheduleK1Form1065 = toScheduleK1Form1065(k1)
        if (scheduleK1Form1065 === undefined) return ''
        return <span>{formatEIN(scheduleK1Form1065.partnershipEin)}</span>
      }}
    >
      {' '}
      <Grid container spacing={2}>
        <h3>Partnership Income from Schedule K1 (Form 1065)</h3>
        <LabeledInput label="Partnership name" name="partnershipName" />
        <LabeledInput
          label="Partnership EIN"
          name="partnershipEin"
          patternConfig={Patterns.ein}
        />
        <GenericLabeledDropdown
          dropDownData={['Partnership', 'S Corporation']}
          label="Partnership or S Corporation"
          required={true}
          valueMapping={(t) => t.substring(0, 1)}
          name="partnerOrSCorp"
          keyMapping={(k: string, i: number) => i}
          textMapping={(t) => t}
        />
        <LabeledCheckbox
          label=" If a foreign partner, check this box"
          name="isForeign"
        />
        <LabeledCheckbox
          label=" If you are a passive partner, check this box"
          name="isPassive"
        />
        <LabeledInput
          label={boxLabel('1', 'Ordinary business income (loss)')}
          patternConfig={Patterns.currency}
          name="ordinaryBusinessIncome"
        />
        <LabeledInput
          label={boxLabel('4a', 'Guaranteed payments for services')}
          patternConfig={Patterns.currency}
          name="guaranteedPaymentsForServices"
        />
        <LabeledInput
          label={boxLabel('4b', 'Guaranteed payments for capital')}
          patternConfig={Patterns.currency}
          name="guaranteedPaymentsForCapital"
        />
        <LabeledInput
          label={boxLabel('5', 'Interest Income')}
          patternConfig={Patterns.currency}
          name="interestIncome"
        />
        <LabeledInput
          label={boxLabel('14', 'Self-employment earnings (loss) - Code A')}
          patternConfig={Patterns.currency}
          name="selfEmploymentEarningsA"
        />
        <LabeledInput
          label={boxLabel('14', 'Self-employment earnings (loss) - Code B')}
          patternConfig={Patterns.currency}
          name="selfEmploymentEarningsB"
        />
        <LabeledInput
          label={boxLabel('14', 'Self-employment earnings (loss) - Code C')}
          patternConfig={Patterns.currency}
          name="selfEmploymentEarningsC"
        />
        <LabeledInput
          label={boxLabel('19', 'Distributions - Code A')}
          patternConfig={Patterns.currency}
          name="distributionsCodeAAmount"
        />
        <LabeledInput
          label={boxLabel('20', 'Other information - Code Z')}
          patternConfig={Patterns.currency}
          name="section199AQBI"
        />
        <GenericLabeledDropdown
          dropDownData={people}
          label="Employee"
          required={true}
          valueMapping={(p: Person, i: number) =>
            [PersonRole.PRIMARY, PersonRole.SPOUSE][i]
          }
          name="personRole"
          keyMapping={(p: Person, i: number) => i}
          textMapping={(p) =>
            `${p.firstName} ${p.lastName} (${formatSSID(p.ssid)})`
          }
        />
      </Grid>
    </FormListContainer>
  )

  const spouseScheduleK1Form1065Message: ReactNode = (() => {
    if (
      spouse !== undefined &&
      spouseScheduleK1Form1065s.length > 0 &&
      filingStatus === FilingStatus.MFS
    ) {
      return (
        <div>
          <Box marginBottom={3}>
            <Alert className="inner" severity="warning">
              Filing status is set to Married Filing Separately.{' '}
              <strong>{spouse.firstName}</strong>
              &apos;s ScheduleK1Form1065s will not be added to the return.
            </Alert>
          </Box>
        </div>
      )
    }
  })()

  return (
    <FormProvider {...methods}>
      <form
        tabIndex={-1}
        onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
      >
        <Helmet>
          <title>Partnership Income | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Partnership Income</h2>
        <p>
          If you received Schedule K-1 (Form 1065), enter the information here.
        </p>
        {form}
        {spouseScheduleK1Form1065Message}
        {navButtons}
      </form>
    </FormProvider>
  )
}

export default PartnershipIncome
