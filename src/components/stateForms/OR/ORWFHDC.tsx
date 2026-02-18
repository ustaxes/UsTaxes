import { ReactElement, useState, useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Helmet } from 'react-helmet'

import { useYearSelector } from 'ustaxes/redux/yearDispatch'

import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Grid, Box } from '@material-ui/core'
import { Person as PersonIcon } from '@material-ui/icons'
import { Alert } from '@material-ui/lab'

import { PersonFields } from '../../TaxPayer/PersonFields'
import AddressFields from '../../TaxPayer/Address'
import { usePager } from 'ustaxes/components/pager'
import { intentionallyFloat } from 'ustaxes/core/util'

import {
  formatSSID,
  GenericLabeledDropdown,
  LabeledInput,
  LabeledCheckbox
} from 'ustaxes/components/input'

import {
  Address,
  PersonRole,
  ContactInfo,
  Person,
  Information
} from 'ustaxes/core/data'

import { TaxesState } from 'ustaxes/redux'

interface OR40WFHDCDependent {
  userExpense: number
  otherExpense: number
  personRelation: string
  isDisabled: boolean
  isChild13: boolean
}

interface OR40WFHDCDependentUserInput {
  userExpense: string
  otherExpense: string
  personRelation: string
  isDisabled: boolean
  isChild13: boolean
}

const blankUserInputDependent: OR40WFHDCDependentUserInput = {
  userExpense: '',
  otherExpense: '',
  personRelation: '',
  isDisabled: false,
  isChild13: false
}

const toOR40WFHDCDependent = (
  formData: OR40WFHDCDependentUserInput
): OR40WFHDCDependent => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  userExpense: Number(formData.userExpense),
  otherExpense: Number(formData.otherExpense),
  personRelation: formData.personRelation,
  isDisabled: formData.isDisabled,
  isChild13: formData.isChild13
})

const toOR40WFHDCDependentInput = (
  data: OR40WFHDCDependent
): OR40WFHDCDependentUserInput => ({
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  userExpense: data.userExpense.toString(),
  otherExpense: data.otherExpense.toString(),
  personRelation: data.personRelation,
  isDisabled: data.isDisabled,
  isChild13: data.isChild13
})

export const QualifyingIndividual = (): ReactElement => {
  const [wfhdcDependent, setWfhdcDependent] = useState<OR40WFHDCDependent[]>([])

  const [error, setError] = useState<ReactElement | undefined>(undefined)

  const information: Information = useYearSelector(
    (state: TaxesState) => state.information
  )

  const people: Person[] = [
    information.taxPayer.spouse,
    ...information.taxPayer.dependents.map((x) => {
      x.role = PersonRole.DEPENDENT
      return x
    })
  ]
    .filter((p) => p !== undefined)
    .map((p) => p as Person)

  const peopleFiltered: Person[] = people.filter((p) => {
    return wfhdcDependent.every((w) => {
      return p.ssid !== w.personRelation
    })
  })

  const defaultValues = blankUserInputDependent

  const methods = useForm<OR40WFHDCDependentUserInput>({
    defaultValues
  })

  const { watch } = methods

  const selectedIndex: string | undefined = watch('personRelation')
  const selectedRole = people.find((x) => x.ssid === selectedIndex)?.role
  const isDisabledCheck: boolean = watch('isDisabled')
  const isChild13Check: boolean = watch('isChild13')

  useEffect(() => {
    switch (selectedRole) {
      case PersonRole.SPOUSE: {
        if (!isDisabledCheck) {
          setError(
            <Box padding={2}>
              <Alert severity="warning">
                For your spouse to be claimed as credit, he/she must be disabled
                and residing with you for over half a year.
              </Alert>
            </Box>
          )
        } else {
          setError(undefined)
        }
        break
      }

      case PersonRole.DEPENDENT: {
        if (!(isDisabledCheck || isChild13Check)) {
          setError(
            <Box padding={2}>
              <Alert severity="warning">
                For dependent to be claimed as credit, he/she must be disabled
                and residing with you for over half a year or your child under
                the age of 13.
              </Alert>
            </Box>
          )
        } else {
          setError(undefined)
        }
        break
      }

      default: {
        setError(undefined)
      }
    }
  }, [selectedRole, isDisabledCheck, isChild13Check])

  const onSubmit = (formData: OR40WFHDCDependentUserInput): void => {
    const payload = toOR40WFHDCDependent(formData)
    if (error === undefined) {
      setWfhdcDependent((prevWfhdc) => [...prevWfhdc, payload])
    }
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: OR40WFHDCDependentUserInput): void => {
      const payload = toOR40WFHDCDependent(formData)
      if (error === undefined) {
        setWfhdcDependent((prevWfhdc) => {
          const newArray = [...prevWfhdc]
          newArray[index] = payload
          return newArray
        })
      }
    }

  const removeField = (index: number) => {
    setWfhdcDependent((prevWfhdc) => prevWfhdc.filter((p, i) => i !== index))
  }

  const spouseFields = (
    <LabeledCheckbox
      label="Check if individual is a disabled person who resided with you for more than half the year"
      name="isDisabled"
    />
  )

  const childFields = (
    <>
      {spouseFields}
      <LabeledCheckbox
        label="Check if individual is your child under 13 years of age"
        name="isChild13"
      />
    </>
  )

  const specificFields = {
    [PersonRole.SPOUSE]: spouseFields,
    [PersonRole.DEPENDENT]: childFields
  }

  const page = (
    <FormListContainer<OR40WFHDCDependentUserInput>
      defaultValues={defaultValues}
      onSubmitAdd={onSubmit}
      onSubmitEdit={onSubmitEdit}
      removeItem={(i) => removeField(i)}
      items={wfhdcDependent.map((a) => toOR40WFHDCDependentInput(a))}
      icon={() => <PersonIcon />}
      primary={(wfhdc) => {
        const p = people.find((x) => x.ssid === wfhdc.personRelation) as Person
        return `${p.role} - ${p.firstName} ${p.lastName}`
      }}
      secondary={(wfhdc) => {
        const totalExpense = (
          parseInt(wfhdc.userExpense) + parseInt(wfhdc.otherExpense)
        ).toString()
        return `Total Expense: ${totalExpense}`
      }}
    >
      <p>Add Qualifying Dependent</p>
      <Grid container spacing={2}>
        <GenericLabeledDropdown
          dropDownData={peopleFiltered}
          label="Recipient"
          required={true}
          valueMapping={(p: Person) => p.ssid}
          name="personRelation"
          keyMapping={(p: Person, i: number) => i}
          textMapping={(p: Person) =>
            `${p.firstName} ${p.lastName} ${formatSSID(p.ssid)}`
          }
        />
        {selectedIndex !== ''
          ? specificFields[
              people.find((x) => x.ssid === selectedIndex)?.role as
                | PersonRole.SPOUSE
                | PersonRole.DEPENDENT
            ]
          : undefined}
        {error}
        <LabeledInput
          name="userExpense"
          label="Portion of expenses paid on your behalf"
          patternConfig={Patterns.currency}
          sizes={{ xs: 12 }}
        />
        <LabeledInput
          name="otherExpense"
          label="Portion of expenses you paid for care"
          patternConfig={Patterns.currency}
          sizes={{ xs: 12 }}
        />
      </Grid>
    </FormListContainer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

interface OR40WFHDCProviderUserInput extends Person, ContactInfo {
  address: Address
  relationshipCode: string
}

interface OR40WFHDCProvider extends Person, ContactInfo {
  address: Address
  relationshipCode: string
}

const blankUserInputProvider: OR40WFHDCProviderUserInput = {
  firstName: '',
  lastName: '',
  ssid: '',
  role: PersonRole.PRIMARY,
  contactPhoneNumber: '',
  contactEmail: '',
  address: {
    address: '',
    city: '',
    aptNo: '',
    state: undefined,
    zip: undefined
  },
  relationshipCode: '',
  isBlind: false,
  dateOfBirth: new Date(0, 0, 0)
}

const toOR40WFHDCProvider = (
  formData: OR40WFHDCProviderUserInput
): OR40WFHDCProvider => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  firstName: formData.firstName,
  lastName: formData.lastName,
  ssid: formData.ssid,
  contactPhoneNumber: formData.contactPhoneNumber,
  contactEmail: formData.contactEmail,
  address: formData.address,
  relationshipCode: formData.relationshipCode
})

const toOR40WFHDCProviderInput = (
  data: OR40WFHDCProvider
): OR40WFHDCProviderUserInput => ({
  ...data,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  firstName: data.firstName,
  lastName: data.lastName,
  ssid: data.ssid,
  contactPhoneNumber: data.contactPhoneNumber,
  contactEmail: data.contactEmail,
  address: data.address,
  relationshipCode: data.relationshipCode
})

export const Provider = (): ReactElement => {
  const [wfhdcProvider, setWfhdcProvider] = useState<OR40WFHDCProvider[]>([])

  const defaultValues = blankUserInputProvider

  const methods = useForm<OR40WFHDCProviderUserInput>({
    defaultValues
  })

  const onSubmit = (formData: OR40WFHDCProviderUserInput): void => {
    const payload = toOR40WFHDCProvider(formData)
    setWfhdcProvider((prevWfhdc) => [...prevWfhdc, payload])
  }

  const onSubmitEdit =
    (index: number) =>
    (formData: OR40WFHDCProviderUserInput): void => {
      const payload = toOR40WFHDCProvider(formData)
      setWfhdcProvider((prevWfhdc) => {
        const newArray = [...prevWfhdc]
        newArray[index] = payload
        return newArray
      })
    }

  const removeField = (index: number) => {
    setWfhdcProvider((prevWfhdc) => prevWfhdc.filter((p, i) => i !== index))
  }

  const relationshipCodes: { code: string; desc: string }[] = [
    {
      code: 'SD',
      desc: 'Son/Daughter - Son daughter, adopted child'
    },
    {
      code: 'SC',
      desc: 'Stepchild - Stepson, stepdaughter'
    },
    {
      code: 'FC',
      desc: 'Foster Child'
    },
    {
      code: 'SB',
      desc: 'Sibling - Brother, sister, half-brother, step-sister...'
    },
    {
      code: 'PT',
      desc: 'Parent - Father, mother, stepfather...'
    },
    {
      code: 'SP',
      desc: 'Spouse - Husband, wife'
    },
    {
      code: 'GP',
      desc: 'Grandparent - Grandmother, grandfather'
    },
    {
      code: 'GC',
      desc: 'Grandchild - Grandson, granddaughter'
    },
    {
      code: 'AU',
      desc: 'Aunt/Uncle - Aunt, Uncle'
    },
    {
      code: 'NN',
      desc: 'Niece/Nephew - Niece, Nephew'
    },
    {
      code: 'OR',
      desc: 'Other relative - Son-in-law, daughter-in-law, cousin...'
    },
    {
      code: 'NR',
      desc: 'No Relation - Any other qualifying individual'
    }
  ]

  const page = (
    <FormListContainer<OR40WFHDCProviderUserInput>
      defaultValues={defaultValues}
      items={wfhdcProvider.map((a) => toOR40WFHDCProviderInput(a))}
      icon={() => <PersonIcon />}
      onSubmitAdd={onSubmit}
      onSubmitEdit={onSubmitEdit}
      removeItem={(i) => removeField(i)}
      primary={(wfhdc) => wfhdc.firstName + ' ' + wfhdc.lastName}
      secondary={(wfhdc) =>
        `Contact Phone Number: ${
          toOR40WFHDCProvider(wfhdc).contactPhoneNumber ?? ''
        }`
      }
    >
      <p>Add Provider</p>
      <Grid container spacing={2}>
        <PersonFields />
        <GenericLabeledDropdown
          dropDownData={relationshipCodes}
          label="Relationship to Qualifying Dependent"
          required={true}
          valueMapping={(c: { code: string; desc: string }) => c.code}
          name="relationshipCode"
          keyMapping={(c: { code: string; desc: string }, i: number) => i}
          textMapping={(c: { code: string; desc: string }) => c.desc}
        />
        <LabeledInput
          label="Contact phone number"
          patternConfig={Patterns.usPhoneNumber}
          name="contactPhoneNumber"
        />
        <LabeledInput
          label="Contact email address"
          required={true}
          name="contactEmail"
        />
        <AddressFields
          checkboxText="Do you have an foreign address?"
          allowForeignCountry={false}
        />
      </Grid>
    </FormListContainer>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

interface OR40WFHDCHouseHold {
  unclaimedExemptions: number
  claimedExemptions: number
}

interface OR40WFHDCHouseHoldUserInput {
  unclaimedExemptions: string
  claimedExemptions: string
}

const blankUserInputHouseHold: OR40WFHDCHouseHoldUserInput = {
  unclaimedExemptions: '',
  claimedExemptions: ''
}

const toOR40WFHDCHouseHold = (
  formData: OR40WFHDCHouseHoldUserInput
): OR40WFHDCHouseHold => ({
  ...formData,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  unclaimedExemptions: Number(formData.unclaimedExemptions),
  claimedExemptions: Number(formData.claimedExemptions)
})

const toOR40WFHDCHouseHoldInput = (
  data: OR40WFHDCHouseHold
): OR40WFHDCHouseHoldUserInput => ({
  ...data,
  // Note we are not error checking here because
  // we are already in the input validated happy path
  // of handleSubmit.
  unclaimedExemptions: data.unclaimedExemptions.toString(),
  claimedExemptions: data.claimedExemptions.toString()
})

export const HouseHoldFields = (): ReactElement => {
  const { onAdvance, navButtons } = usePager()

  const [wfhdcHouseHold, setWfhdcHouseHold] = useState<OR40WFHDCHouseHold>({
    unclaimedExemptions: 0,
    claimedExemptions: 0
  })

  const currHouseHoldForm: OR40WFHDCHouseHoldUserInput = {
    ...blankUserInputHouseHold,
    ...(wfhdcHouseHold.unclaimedExemptions !== 0 &&
    wfhdcHouseHold.claimedExemptions !== 0
      ? {
          ...toOR40WFHDCHouseHoldInput(wfhdcHouseHold)
        }
      : {})
  }

  const methods = useForm<OR40WFHDCHouseHoldUserInput>({
    defaultValues: currHouseHoldForm
  })

  const { handleSubmit } = methods

  const onSubmit = (form: OR40WFHDCHouseHoldUserInput): void => {
    const payload = toOR40WFHDCHouseHold(form)
    console.log(payload)
    setWfhdcHouseHold(payload)
    onAdvance()
  }

  const page = (
    <form tabIndex={-1} onSubmit={intentionallyFloat(handleSubmit(onSubmit))}>
      <Grid container spacing={2}>
        <LabeledInput
          label="Unclaimed Exemptions"
          patternConfig={Patterns.currency}
          name="unclaimedExemptions"
        />
        <LabeledInput
          label="Claimed Exemptions"
          patternConfig={Patterns.currency}
          name="claimedExemptions"
        />
      </Grid>
      {navButtons}
    </form>
  )

  return <FormProvider {...methods}>{page}</FormProvider>
}

const ORWFHDC = (): ReactElement => (
  <>
    <Helmet>
      <title>OR-WFHDC | OR State Tax Forms | UsTaxes.org</title>
    </Helmet>
    <h2>Oregon Working Household Dependent Care Credit</h2>
    <h3>Qualifying Dependent Information</h3>
    <QualifyingIndividual />
    <h3>Provider Information</h3>
    <Provider />
    <h3>Additional Information</h3>
    <HouseHoldFields />
  </>
)

export default ORWFHDC
