import { Person, IncomeW2, Refund, TaxPayer, Dependent } from './data'

export enum ActionName {
  SAVE_REFUND_INFO = 'SAVE_REFUND_INFO',
  SAVE_TAXPAYER_INFO = 'SAVE_TAXPAYER_INFO',
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
type SaveTaxpayerInfo = Save<typeof ActionName.SAVE_TAXPAYER_INFO, TaxPayer>
type AddDependent = Save<typeof ActionName.ADD_DEPENDENT, Dependent>
type RemoveDependent = Save<typeof ActionName.REMOVE_DEPENDENT, number>
type AddSpouse = Save<typeof ActionName.ADD_SPOUSE, Person>
type RemoveSpouse = Save<typeof ActionName.REMOVE_SPOUSE, {}>
type AddW2 = Save<typeof ActionName.ADD_W2, IncomeW2>
type RemoveW2 = Save<typeof ActionName.REMOVE_W2, number>

export type Actions =
  SaveRefundInfo
  | SaveTaxpayerInfo
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

function makeAction<A extends Object, T extends ActionName> (t: T): ((formData: A) => Save<T, A>) {
  return (formData: A): Save<typeof t, A> => ({
    type: t,
    formData: formData
  })
}

function makeAction2<A extends Object, T extends ActionName> (t: T, clean: (d: A) => Partial<A>): ((formData: A) => Save<T, A>) {
  return (formData: A): Save<T, A> => ({
    type: t,
    formData: { ...formData, ...clean(formData) }
  })
}

export const saveRefundInfo: ActionCreator<Refund> =
  makeAction(ActionName.SAVE_REFUND_INFO)

const cleanPerson = <P extends Person>(p: P): P => ({
  ...p,
  ssid: p?.ssid.replace(/-/g, '')
})

export const saveTaxpayerInfo: ActionCreator<TaxPayer> = makeAction2(
  ActionName.SAVE_TAXPAYER_INFO,
  t => ({
    contactPhoneNumber: t.contactPhoneNumber?.replace(/-/g, ''),
    primaryPerson: t.primaryPerson !== undefined ? cleanPerson(t.primaryPerson) : undefined,
    spouse: t.spouse !== undefined ? cleanPerson(t.spouse) : undefined
  })
)

export const addDependent: ActionCreator<Dependent> = makeAction2(
  ActionName.ADD_DEPENDENT,
  (t: Dependent) => cleanPerson(t)
)

export const removeDependent: ActionCreator<number> = makeAction(
  ActionName.REMOVE_DEPENDENT
)

export const addSpouse: ActionCreator<Person> = makeAction2(
  ActionName.ADD_SPOUSE,
  cleanPerson
)

export const removeSpouse: Actions = signalAction(
  ActionName.REMOVE_SPOUSE
)

export const addW2: ActionCreator<IncomeW2> = makeAction2(
  ActionName.ADD_W2,
  (t) => ({
    income: t.income,
    fedWitholding: t.fedWithholding
  })
)

export const removeW2: ActionCreator<number> = makeAction(
  ActionName.REMOVE_W2
)
