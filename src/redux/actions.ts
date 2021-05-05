import { Person, IncomeW2, Refund, Dependent, FilingStatus, PrimaryPerson, ContactInfo, Supported1099, Spouse, EditDependentAction, Edit1099Action, EditW2Action } from './data'
import { ValidateFunction } from 'ajv-latest'
import ajv, { checkType } from './validate'

export enum ActionName {
  SAVE_REFUND_INFO = 'SAVE_REFUND_INFO',
  SAVE_PRIMARY_PERSON_INFO = 'SAVE_TAXPAYER_INFO',
  SAVE_CONTACT_INFO = 'SAVE_CONTACT_INFO',
  SAVE_FILING_STATUS_INFO = 'SAFE_FILING_STATUS_INFO',
  ADD_DEPENDENT = 'TAXPAYER/ADD_DEPENDENT',
  EDIT_DEPENDENT = 'TAXPAYER/EDIT_DEPENDENT',
  REMOVE_DEPENDENT = 'TAXPAYER/REMOVE_DEPENDENT',
  ADD_SPOUSE = 'TAXPAYER/ADD_SPOUSE',
  REMOVE_SPOUSE = 'TAXPAYER/REMOVE_SPOUSE',
  ADD_W2 = 'ADD_W2',
  EDIT_W2 = 'EDIT_W2',
  REMOVE_W2 = 'REMOVE_W2',
  ADD_1099 = 'ADD_1099',
  EDIT_1099 = 'EDIT_1099',
  REMOVE_1099 = 'REMOVE_1099'
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
type EditDependent = Save<typeof ActionName.EDIT_DEPENDENT, EditDependentAction>
type RemoveDependent = Save<typeof ActionName.REMOVE_DEPENDENT, number>
type AddSpouse = Save<typeof ActionName.ADD_SPOUSE, Spouse>
type RemoveSpouse = Save<typeof ActionName.REMOVE_SPOUSE, {}>
type AddW2 = Save<typeof ActionName.ADD_W2, IncomeW2>
type EditW2 = Save<typeof ActionName.EDIT_W2, EditW2Action>
type RemoveW2 = Save<typeof ActionName.REMOVE_W2, number>
type Add1099 = Save<typeof ActionName.ADD_1099, Supported1099>
type Edit1099 = Save<typeof ActionName.EDIT_1099, Edit1099Action>
type Remove1099 = Save<typeof ActionName.REMOVE_1099, number>

export type Actions =
  SaveRefundInfo
  | SavePrimaryPersonInfo
  | SaveFilingStatusInfo
  | SaveContactInfo
  | AddDependent
  | EditDependent
  | RemoveDependent
  | AddSpouse
  | RemoveSpouse
  | AddW2
  | EditW2
  | RemoveW2
  | Add1099
  | Edit1099
  | Remove1099

export type ActionCreator<A> = (formData: A) => Actions

function signalAction<T extends ActionName> (t: T): Save<T, {}> {
  return {
    type: t,
    formData: {}
  }
}

/**
  *  Create an action constructor given an action name and a validator
  *  for the action's payload. The validator checks the payload against
  *  the schema at runtime so we can see errors if data of the wrong types
  *  about to be inserted into the
  */
function makeActionCreator<A extends Object, T extends ActionName> (
  t: T,
  validate: ValidateFunction<A>
): ((formData: A) => Save<T, A>) {
  return (formData: A): Save<typeof t, A> => ({
    type: t,
    formData: checkType<A>(formData, validate)
  })
}

/**
  * This variant includes a preprocessor function that can be used to
  * apply formatting changes to provided data, for example.
  */
function makePreprocessActionCreator<A extends Object, T extends ActionName> (
  t: T,
  validate: ValidateFunction<A>,
  clean: (d: A) => Partial<A>
): ((formData: A) => Save<T, A>) {
  return (formData: A): Save<T, A> => ({
    type: t,
    formData: checkType({ ...formData, ...clean(formData) }, validate)
  })
}

export const saveRefundInfo: ActionCreator<Refund> =
  makeActionCreator(
    ActionName.SAVE_REFUND_INFO,
    ajv.getSchema('#/definitions/Refund') as ValidateFunction<Refund>
  )

const cleanPerson = <P extends Person>(p: P): P => ({
  ...p,
  ssid: p?.ssid.replace(/-/g, '')
})

export const savePrimaryPersonInfo: ActionCreator<PrimaryPerson> = makePreprocessActionCreator(
  ActionName.SAVE_PRIMARY_PERSON_INFO,
  ajv.getSchema('#/definitions/PrimaryPerson') as ValidateFunction<PrimaryPerson>,
  cleanPerson
)

export const saveFilingStatusInfo: ActionCreator<FilingStatus> = makeActionCreator(
  ActionName.SAVE_FILING_STATUS_INFO,
  ajv.getSchema('#/definitions/FilingStatus') as ValidateFunction<FilingStatus>
)

export const saveContactInfo: ActionCreator<ContactInfo> = makePreprocessActionCreator(
  ActionName.SAVE_CONTACT_INFO,
  ajv.getSchema('#/definitions/ContactInfo') as ValidateFunction<ContactInfo>,
  t => ({
    ...t,
    contactPhoneNumber: t.contactPhoneNumber?.replace(/-/g, '')
  })
)

export const addDependent: ActionCreator<Dependent> = makePreprocessActionCreator(
  ActionName.ADD_DEPENDENT,
  ajv.getSchema('#/definitions/Dependent') as ValidateFunction<Dependent>,
  (t: Dependent) => cleanPerson(t)
)

export const editDependent: ActionCreator<EditDependentAction> = makePreprocessActionCreator(
  ActionName.EDIT_DEPENDENT,
  ajv.getSchema('#/definitions/EditDependentAction') as ValidateFunction<EditDependentAction>,
  ({ index, value }: EditDependentAction) => ({ index, value: cleanPerson(value) })
)

const indexSchema = {
  type: 'number',
  minimum: 0
}

export const removeDependent: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_DEPENDENT,
  ajv.compile(indexSchema)
)

export const addSpouse: ActionCreator<Spouse> = makePreprocessActionCreator(
  ActionName.ADD_SPOUSE,
  ajv.getSchema('#/definitions/Spouse') as ValidateFunction<Spouse>,
  cleanPerson
)

export const removeSpouse: Actions = signalAction(
  ActionName.REMOVE_SPOUSE
)

export const addW2: ActionCreator<IncomeW2> = makeActionCreator(
  ActionName.ADD_W2,
  ajv.getSchema('#/definitions/IncomeW2') as ValidateFunction<IncomeW2>
)

export const editW2: ActionCreator<EditW2Action> = makeActionCreator(
  ActionName.EDIT_W2,
  ajv.getSchema('#/definitions/EditW2Action') as ValidateFunction<EditW2Action>
)

export const removeW2: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_W2,
  ajv.compile(indexSchema)
)

export const add1099: ActionCreator<Supported1099> = makeActionCreator(
  ActionName.ADD_1099,
  ajv.getSchema('#/definitions/Supported1099') as ValidateFunction<Supported1099>
)

export const edit1099: ActionCreator<Edit1099Action> = makeActionCreator(
  ActionName.EDIT_1099,
  ajv.getSchema('#/definitions/Edit1099Action') as ValidateFunction<Edit1099Action>
)

export const remove1099: ActionCreator<number> = makeActionCreator(
  ActionName.REMOVE_1099,
  ajv.compile(indexSchema)
)
