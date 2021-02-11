import { Person, IncomeW2, Refund, Dependent, FilingStatus, PrimaryPerson, ContactInfo } from './data'
import { ValidateFunction } from 'ajv'
import validations, { checkType } from './validate'

const ajv = validations()

export enum ActionName {
  SAVE_REFUND_INFO = 'SAVE_REFUND_INFO',
  SAVE_PRIMARY_PERSON_INFO = 'SAVE_TAXPAYER_INFO',
  SAVE_CONTACT_INFO = 'SAVE_CONTACT_INFO',
  SAVE_FILING_STATUS_INFO = 'SAFE_FILING_STATUS_INFO',
  ADD_DEPENDENT = 'TAXPAYER/ADD_DEPENDENT',
  REMOVE_DEPENDENT = 'TAXPAYER/REMOVE_DEPENDENT',
  ADD_SPOUSE = 'TAXPAYER/ADD_SPOUSE',
  REMOVE_SPOUSE = 'TAXPAYER/REMOVE_SPOUSE',
  ADD_W2 = 'ADD_W2',
  REMOVE_W2 = 'REMOVE_W2',
}

interface Save<T, R> {
  type: T
  formData: R
}

type SaveRefundInfo = Save<typeof ActionName.SAVE_REFUND_INFO, Refund>
type SavePrimaryPersonInfo = Save<typeof ActionName.SAVE_PRIMARY_PERSON_INFO, PrimaryPerson>
type SaveFilingStatusInfo = Save<typeof ActionName.SAVE_FILING_STATUS_INFO, FilingStatus>
type SaveContactInfo = Save<typeof ActionName.SAVE_CONTACT_INFO, ContactInfo>
type AddDependent = Save<typeof ActionName.ADD_DEPENDENT, Dependent>
type RemoveDependent = Save<typeof ActionName.REMOVE_DEPENDENT, number>
type AddSpouse = Save<typeof ActionName.ADD_SPOUSE, Person>
type RemoveSpouse = Save<typeof ActionName.REMOVE_SPOUSE, {}>
type AddW2 = Save<typeof ActionName.ADD_W2, IncomeW2>
type RemoveW2 = Save<typeof ActionName.REMOVE_W2, number>

export type Actions =
  SaveRefundInfo
  | SavePrimaryPersonInfo
  | SaveFilingStatusInfo
  | SaveContactInfo
  | AddDependent
  | RemoveDependent
  | AddSpouse
  | RemoveSpouse
  | AddW2
  | RemoveW2

export type ActionCreator<A> = (formData: A) => Actions

function signalAction<T extends ActionName> (t: T): Save<T, {}> {
  return {
    type: t,
    formData: {}
  }
}

function makeAction<A extends Object, T extends ActionName> (t: T, validate: ValidateFunction<A>): ((formData: A) => Save<T, A>) {
  return (formData: A): Save<typeof t, A> => ({
    type: t,
    formData: checkType<A>(formData, validate)
  })
}

function makeAction2<A extends Object, T extends ActionName> (t: T, validate: ValidateFunction<A>, clean: (d: A) => Partial<A>): ((formData: A) => Save<T, A>) {
  return (formData: A): Save<T, A> => ({
    type: t,
    formData: checkType({ ...formData, ...clean(formData) }, validate)
  })
}

export const saveRefundInfo: ActionCreator<Refund> =
  makeAction(
    ActionName.SAVE_REFUND_INFO,
    ajv.getSchema('#/definitions/Refund') as ValidateFunction<Refund>
  )

const cleanPerson = <P extends Person>(p: P): P => ({
  ...p,
  ssid: p?.ssid.replace(/-/g, '')
})

export const savePrimaryPersonInfo: ActionCreator<PrimaryPerson> = makeAction2(
  ActionName.SAVE_PRIMARY_PERSON_INFO,
  ajv.getSchema('#/definitions/PrimaryPerson') as ValidateFunction<PrimaryPerson>,
  cleanPerson
)

export const saveFilingStatusInfo: ActionCreator<FilingStatus> = makeAction(
  ActionName.SAVE_FILING_STATUS_INFO,
  ajv.getSchema('#/definitions/FilingStatus') as ValidateFunction<FilingStatus>
)

export const saveContactInfo: ActionCreator<ContactInfo> = makeAction2(
  ActionName.SAVE_CONTACT_INFO,
  ajv.getSchema('#/definitions/ContactInfo') as ValidateFunction<ContactInfo>,
  t => ({
    ...t,
    contactPhoneNumber: t.contactPhoneNumber?.replace(/-/g, '')
  })
)

export const addDependent: ActionCreator<Dependent> = makeAction2(
  ActionName.ADD_DEPENDENT,
  ajv.getSchema('#/definitions/Dependent') as ValidateFunction<Dependent>,
  (t: Dependent) => cleanPerson(t)
)

const indexSchema = {
  type: 'number',
  minimum: 0
}

export const removeDependent: ActionCreator<number> = makeAction(
  ActionName.REMOVE_DEPENDENT,
  ajv.compile(indexSchema)
)

export const addSpouse: ActionCreator<Person> = makeAction2(
  ActionName.ADD_SPOUSE,
  ajv.getSchema('#/definitions/Person') as ValidateFunction<Person>,
  cleanPerson
)

export const removeSpouse: Actions = signalAction(
  ActionName.REMOVE_SPOUSE
)

export const addW2: ActionCreator<IncomeW2> = makeAction2(
  ActionName.ADD_W2,
  ajv.getSchema('#/definitions/IncomeW2') as ValidateFunction<IncomeW2>,
  (t) => ({
    income: t.income,
    fedWithholding: t.fedWithholding
  })
)

export const removeW2: ActionCreator<number> = makeAction(
  ActionName.REMOVE_W2,
  ajv.compile(indexSchema)
)
