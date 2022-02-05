import {
  Person,
  IncomeW2,
  Refund,
  Dependent,
  FilingStatus,
  PrimaryPerson,
  ContactInfo,
  Supported1099,
  F1098e,
  Spouse,
  Property,
  StateResidency,
  Information,
  EstimatedTaxPayments,
  Responses,
  HealthSavingsAccount,
  Ira
} from 'ustaxes/core/data'

import {
  EditDependentAction,
  EditPropertyAction,
  Edit1099Action,
  EditW2Action,
  EditEstimatedTaxesAction,
  Edit1098eAction,
  EditHSAAction,
  EditIraAction
} from './data'
import ajv, * as validators from 'ustaxes/core/data/validate'
import { TaxYear } from 'ustaxes/data'
import { ValidateFunction } from 'ajv'

const indexSchema = {
  type: 'number',
  minimum: 0
}

const indexValidator: ValidateFunction<number> = ajv.compile(indexSchema)

export enum ActionName {
  SAVE_REFUND_INFO = 'SAVE_REFUND_INFO',
  SAVE_PRIMARY_PERSON_INFO = 'SAVE_TAXPAYER_INFO',
  SAVE_CONTACT_INFO = 'SAVE_CONTACT_INFO',
  SAVE_STATE_RESIDENCY = 'SAVE_STATE_RESIDENCY',
  SAVE_FILING_STATUS_INFO = 'SAFE_FILING_STATUS_INFO',
  ADD_DEPENDENT = 'TAXPAYER/ADD_DEPENDENT',
  EDIT_DEPENDENT = 'TAXPAYER/EDIT_DEPENDENT',
  REMOVE_DEPENDENT = 'TAXPAYER/REMOVE_DEPENDENT',
  ADD_SPOUSE = 'TAXPAYER/ADD_SPOUSE',
  REMOVE_SPOUSE = 'TAXPAYER/REMOVE_SPOUSE',
  ADD_W2 = 'ADD_W2',
  EDIT_W2 = 'EDIT_W2',
  REMOVE_W2 = 'REMOVE_W2',
  ADD_ESTIMATED_TAX = 'ADD_ESTIMATED_TAX',
  EDIT_ESTIMATED_TAX = 'EDIT_ESTIMATED_TAX',
  REMOVE_ESTIMATED_TAX = 'REMOVE_ESTIMATED_TAX',
  ADD_1099 = 'ADD_1099',
  EDIT_1099 = 'EDIT_1099',
  REMOVE_1099 = 'REMOVE_1099',
  ADD_PROPERTY = 'ADD_PROPERTY',
  EDIT_PROPERTY = 'EDIT_PROPERTY',
  REMOVE_PROPERTY = 'REMOVE_PROPERTY',
  ANSWER_QUESTION = 'ANSWER_QUESTION',
  ADD_1098e = 'ADD_1098e',
  EDIT_1098e = 'EDIT_1098e',
  REMOVE_1098e = 'REMOVE_1098e',
  ADD_HSA = 'ADD_HSA',
  EDIT_HSA = 'EDIT_HSA',
  REMOVE_HSA = 'REMOVE_HSA',
  SET_INFO = 'SET_INFO',
  SET_ACTIVE_YEAR = 'SET_ACTIVE_YEAR',
  PROPAGATE_YEAR_DATA = 'PROPAGATE_YEAR_DATA',
  ADD_IRA = 'ADD_IRA',
  EDIT_IRA = 'EDIT_IRA',
  REMOVE_IRA = 'REMOVE_IRA'
}

interface Save<T, R> {
  type: T
  year: TaxYear
  formData: R
}

type SaveRefundInfo = Save<typeof ActionName.SAVE_REFUND_INFO, Refund>
type SavePrimaryPersonInfo = Save<
  typeof ActionName.SAVE_PRIMARY_PERSON_INFO,
  PrimaryPerson
>
type SaveFilingStatusInfo = Save<
  typeof ActionName.SAVE_FILING_STATUS_INFO,
  FilingStatus
>
type SaveContactInfo = Save<typeof ActionName.SAVE_CONTACT_INFO, ContactInfo>
type SaveStateResidencyInfo = Save<
  typeof ActionName.SAVE_STATE_RESIDENCY,
  StateResidency
>
type AddDependent = Save<typeof ActionName.ADD_DEPENDENT, Dependent>
type EditDependent = Save<typeof ActionName.EDIT_DEPENDENT, EditDependentAction>
type RemoveDependent = Save<typeof ActionName.REMOVE_DEPENDENT, number>
type AddSpouse = Save<typeof ActionName.ADD_SPOUSE, Spouse>
type RemoveSpouse = Save<typeof ActionName.REMOVE_SPOUSE, Record<string, never>>
type AddW2 = Save<typeof ActionName.ADD_W2, IncomeW2>
type EditW2 = Save<typeof ActionName.EDIT_W2, EditW2Action>
type RemoveW2 = Save<typeof ActionName.REMOVE_W2, number>
type AddEstimatedTaxes = Save<
  typeof ActionName.ADD_ESTIMATED_TAX,
  EstimatedTaxPayments
>
type EditEstimatedTaxes = Save<
  typeof ActionName.EDIT_ESTIMATED_TAX,
  EditEstimatedTaxesAction
>
type RemoveEstimatedTaxes = Save<typeof ActionName.REMOVE_ESTIMATED_TAX, number>
type AddHSA = Save<typeof ActionName.ADD_HSA, HealthSavingsAccount>
type EditHSA = Save<typeof ActionName.EDIT_HSA, EditHSAAction>
type RemoveHSA = Save<typeof ActionName.REMOVE_HSA, number>
type Add1099 = Save<typeof ActionName.ADD_1099, Supported1099>
type Edit1099 = Save<typeof ActionName.EDIT_1099, Edit1099Action>
type Remove1099 = Save<typeof ActionName.REMOVE_1099, number>
type AddProperty = Save<typeof ActionName.ADD_PROPERTY, Property>
type EditProperty = Save<typeof ActionName.EDIT_PROPERTY, EditPropertyAction>
type RemoveProperty = Save<typeof ActionName.REMOVE_PROPERTY, number>
type AnswerQuestion = Save<typeof ActionName.ANSWER_QUESTION, Responses>
type Add1098e = Save<typeof ActionName.ADD_1098e, F1098e>
type Edit1098e = Save<typeof ActionName.EDIT_1098e, Edit1098eAction>
type Remove1098e = Save<typeof ActionName.REMOVE_1098e, number>
type SetInfo = Save<typeof ActionName.SET_INFO, Information>
type SetActiveYear = Save<typeof ActionName.SET_ACTIVE_YEAR, TaxYear>
type AddIRA = Save<typeof ActionName.ADD_IRA, Ira>
type EditIRA = Save<typeof ActionName.EDIT_IRA, EditIraAction>
type RemoveIRA = Save<typeof ActionName.REMOVE_IRA, number>

export type Actions =
  | SaveRefundInfo
  | SavePrimaryPersonInfo
  | SaveFilingStatusInfo
  | SaveContactInfo
  | SaveStateResidencyInfo
  | AddDependent
  | EditDependent
  | RemoveDependent
  | AddSpouse
  | RemoveSpouse
  | AddW2
  | EditW2
  | RemoveW2
  | AddEstimatedTaxes
  | EditEstimatedTaxes
  | RemoveEstimatedTaxes
  | Add1099
  | Edit1099
  | Remove1099
  | AddProperty
  | EditProperty
  | RemoveProperty
  | AnswerQuestion
  | Add1098e
  | Edit1098e
  | Remove1098e
  | AddHSA
  | EditHSA
  | RemoveHSA
  | SetInfo
  | SetActiveYear
  | AddIRA
  | EditIRA
  | RemoveIRA

export type SignalAction = (year: TaxYear) => Actions
export type ActionCreator<A> = (formData: A) => SignalAction

function signalAction<T extends ActionName>(
  t: T
): (year: TaxYear) => Save<T, Record<string, never>> {
  return (year: TaxYear) => ({
    type: t,
    year,
    formData: {}
  })
}

/**
 *  Create an action constructor given an action name and a validator
 *  for the action's payload. The validator checks the payload against
 *  the schema at runtime so we can see errors if data of the wrong types
 *  about to be inserted into the model
 */
const makeActionCreator =
  <A, T extends ActionName>(t: T, validate?: ValidateFunction<A>) =>
  (formData: A) =>
  (year: TaxYear): Save<T, A> => ({
    type: t,
    year,
    formData:
      validate !== undefined
        ? validators.checkType<A>(formData, validate)
        : formData
  })

/**
 * This variant includes a preprocessor function that can be used to
 * apply formatting changes to provided data, for example.
 */
const makePreprocessActionCreator =
  <A, T extends ActionName>(
    t: T,
    validate: ValidateFunction<A> | undefined,
    clean: (d: A) => Partial<A>
  ) =>
  (formData: A) =>
  (year: TaxYear): Save<T, A> => ({
    type: t,
    year,
    formData:
      validate !== undefined
        ? validators.checkType({ ...formData, ...clean(formData) }, validate)
        : { ...formData, ...clean(formData) }
  })

export const saveRefundInfo: ActionCreator<Refund> = makeActionCreator(
  ActionName.SAVE_REFUND_INFO,
  validators.refund
)

const cleanPerson = <P extends Person>(p: P): P => ({
  ...p,
  ssid: p?.ssid.replace(/-/g, '')
})

export const savePrimaryPersonInfo: ActionCreator<PrimaryPerson> =
  makePreprocessActionCreator(
    ActionName.SAVE_PRIMARY_PERSON_INFO,
    validators.primaryPerson,
    cleanPerson
  )

export const saveStateResidencyInfo: ActionCreator<StateResidency> =
  makeActionCreator(ActionName.SAVE_STATE_RESIDENCY, validators.stateResidency)

export const saveFilingStatusInfo: ActionCreator<FilingStatus> =
  makeActionCreator(ActionName.SAVE_FILING_STATUS_INFO, validators.filingStatus)

export const saveContactInfo: ActionCreator<ContactInfo> =
  makePreprocessActionCreator(
    ActionName.SAVE_CONTACT_INFO,
    validators.contactInfo,
    (t) => ({
      ...t,
      contactPhoneNumber: t.contactPhoneNumber?.replace(/-/g, '')
    })
  )

export const addDependent: ActionCreator<Dependent> =
  makePreprocessActionCreator(
    ActionName.ADD_DEPENDENT,
    validators.dependent,
    (t: Dependent) => cleanPerson(t)
  )

export const editDependent: ActionCreator<EditDependentAction> =
  makePreprocessActionCreator(
    ActionName.EDIT_DEPENDENT,
    undefined,
    ({ index, value }: EditDependentAction) => ({
      index,
      value: cleanPerson(value)
    })
  )

export const removeDependent: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_DEPENDENT,
  indexValidator
)

export const addSpouse: ActionCreator<Spouse> = makePreprocessActionCreator(
  ActionName.ADD_SPOUSE,
  validators.spouse,
  cleanPerson
)

export const removeSpouse: SignalAction = signalAction(ActionName.REMOVE_SPOUSE)

export const addW2: ActionCreator<IncomeW2> = makeActionCreator(
  ActionName.ADD_W2,
  validators.incomeW2
)

export const editW2: ActionCreator<EditW2Action> = makeActionCreator(
  ActionName.EDIT_W2
)

export const removeW2: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_W2,
  indexValidator
)

export const addEstimatedPayment: ActionCreator<EstimatedTaxPayments> =
  makeActionCreator(
    ActionName.ADD_ESTIMATED_TAX,
    validators.estimatedTaxPayments
  )

export const editEstimatedPayment: ActionCreator<EditEstimatedTaxesAction> =
  makeActionCreator(ActionName.EDIT_ESTIMATED_TAX)

export const removeEstimatedPayment: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_ESTIMATED_TAX,
  indexValidator
)

export const addHSA: ActionCreator<HealthSavingsAccount> = makeActionCreator(
  ActionName.ADD_HSA,
  validators.healthSavingsAccounts
)

export const editHSA: ActionCreator<EditHSAAction> = makeActionCreator(
  ActionName.EDIT_HSA,
  ajv.getSchema(
    '#/definitions/EditHSAAction'
  ) as ValidateFunction<EditHSAAction>
)

export const removeHSA: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_HSA,
  indexValidator
)

export const add1099: ActionCreator<Supported1099> = makeActionCreator(
  ActionName.ADD_1099,
  validators.supported1099
)

export const edit1099: ActionCreator<Edit1099Action> = makeActionCreator(
  ActionName.EDIT_1099
)

export const remove1099: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_1099,
  indexValidator
)

export const addProperty: ActionCreator<Property> = makeActionCreator(
  ActionName.ADD_PROPERTY,
  validators.property
)

export const editProperty: ActionCreator<EditPropertyAction> =
  makeActionCreator(ActionName.EDIT_PROPERTY)

export const removeProperty: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_PROPERTY,
  indexValidator
)

export const answerQuestion: ActionCreator<Responses> = makeActionCreator(
  ActionName.ANSWER_QUESTION,
  validators.responses
)

export const add1098e: ActionCreator<F1098e> = makeActionCreator(
  ActionName.ADD_1098e,
  validators.f1098e
)

export const edit1098e: ActionCreator<Edit1098eAction> = makeActionCreator(
  ActionName.EDIT_1098e
)

export const remove1098e: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_1098e,
  indexValidator
)

// debugging purposes only, leaving unchecked.
export const setInfo: ActionCreator<Information> = makeActionCreator(
  ActionName.SET_INFO,
  validators.information
)

export const setActiveYear: ActionCreator<TaxYear> = makeActionCreator(
  ActionName.SET_ACTIVE_YEAR,
  ajv.getSchema('#/definitions/TaxYear') as ValidateFunction<TaxYear>
)

export const addIRA: ActionCreator<Ira> = makeActionCreator(
  ActionName.ADD_IRA,
  validators.individualRetirementArrangements
)

export const editIRA: ActionCreator<EditIraAction> = makeActionCreator(
  ActionName.EDIT_IRA,
  ajv.getSchema(
    '#/definitions/EditIraAction'
  ) as ValidateFunction<EditIraAction>
)

export const removeIRA: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_IRA,
  indexValidator
)
