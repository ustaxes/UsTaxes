import { Responses } from 'ustaxes/data/questions'

export enum PersonRole {
  PRIMARY = 'PRIMARY',
  SPOUSE = 'SPOUSE',
  DEPENDENT = 'DEPENDENT',
  EMPLOYER = 'EMPLOYER'
}

export interface Person {
  firstName: string
  lastName: string
  ssid: string
  role: PersonRole
}

export interface QualifyingInformation {
  birthYear: number
  numberOfMonths: number
  isStudent: boolean
}

export interface Dependent extends Person {
  relationship: string
  qualifyingInfo?: QualifyingInformation
}

export interface Address {
  address: string
  aptNo?: string
  city: string
  state?: State
  zip?: string
  foreignCountry?: string
  province?: string
  postalCode?: string
}

export interface PrimaryPerson extends Person {
  address: Address
  isTaxpayerDependent: boolean
}

export interface Spouse extends Person {
  isTaxpayerDependent: boolean
}

export interface Employer {
  EIN?: string
  employerName?: string
  address?: Address
}

export enum AccountType {
  checking = 'checking',
  savings = 'savings'
}

export interface Refund {
  routingNumber: string
  accountNumber: string
  accountType: AccountType
}

export interface IncomeW2 {
  occupation: string
  income: number
  medicareIncome: number
  fedWithholding: number
  ssWithholding: number
  medicareWithholding: number
  employer?: Employer
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  state?: State
  stateWages?: number
  stateWithholding?: number
}

export interface EstimatedTaxPayments {
  label: string
  payment: number
}

export enum Income1099Type {
  B = 'B',
  INT = 'INT',
  DIV = 'DIV',
  R = 'R',
  SSA = 'SSA'
}

export interface F1099BData {
  shortTermProceeds: number
  shortTermCostBasis: number
  longTermProceeds: number
  longTermCostBasis: number
}

export interface F1099IntData {
  income: number
}

export interface F1099DivData {
  dividends: number
  qualifiedDividends: number
}
/*
 TODO: Add in logic for various different distributions
 that should go in box 4a and 5a. Will need to implement
 form 8606 and Schedule 1 line 19.
 */
export enum PlanType1099 {
  /* IRA includes a traditional IRA, Roth IRA,
   * simplified employee pension (SEP) IRA,
   * and a savings incentive match plan for employees (SIMPLE) IRA
   */
  IRA = 'IRA',
  /* Pension and annuity payments include distributions from 401(k), 403(b), and governmental 457(b) plans.
   */
  Pension = 'Pension'
}

export const PlanType1099Texts = {
  [PlanType1099.IRA]:
    'traditional IRA, Roth IRA, simplified employee pension (SEP) IRA, or savings incentive match plan for employees (SIMPLE) IRA',
  [PlanType1099.Pension]: '401(k), 403(b), or 457(b) plan'
}

export interface F1099RData {
  grossDistribution: number
  taxableAmount: number
  federalIncomeTaxWithheld: number
  planType: PlanType1099
}

export interface F1099SSAData {
  // benefitsPaid: number
  // benefitsRepaid: number
  netBenefits: number
  federalIncomeTaxWithheld: number
}

export interface Income1099<T, D> {
  payer: string
  type: T
  form: D
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

export enum FilingStatus {
  S = 'S',
  MFJ = 'MFJ',
  MFS = 'MFS',
  HOH = 'HOH',
  W = 'W'
}

export type FilingStatusName = keyof typeof FilingStatus

export const FilingStatusTexts = {
  [FilingStatus.S]: 'Single',
  [FilingStatus.MFJ]: 'Married Filing Jointly',
  [FilingStatus.MFS]: 'Married Filing Separately',
  [FilingStatus.HOH]: 'Head of Household',
  [FilingStatus.W]: 'Widow(er)'
}

export const filingStatuses = (p: TaxPayer | undefined): FilingStatus[] => {
  let withDependents: FilingStatus[] = []
  let spouseStatuses: FilingStatus[] = []

  if ((p?.dependents ?? []).length > 0) {
    withDependents = [FilingStatus.HOH]
  }
  if (p?.spouse !== undefined) {
    spouseStatuses = [FilingStatus.MFJ, FilingStatus.MFS]
    // HoH not available if married
    withDependents = []
  } else {
    spouseStatuses = [FilingStatus.S]
  }
  return [...spouseStatuses, ...withDependents, FilingStatus.W]
}

export interface ContactInfo {
  contactPhoneNumber?: string
  contactEmail?: string
}

export interface TaxPayer extends ContactInfo {
  filingStatus?: FilingStatus
  primaryPerson?: PrimaryPerson
  spouse?: Spouse
  dependents: Dependent[]
}

export type Income1099Int = Income1099<Income1099Type.INT, F1099IntData>
export type Income1099B = Income1099<Income1099Type.B, F1099BData>
export type Income1099Div = Income1099<Income1099Type.DIV, F1099DivData>
export type Income1099R = Income1099<Income1099Type.R, F1099RData>
export type Income1099SSA = Income1099<Income1099Type.SSA, F1099SSAData>

export type Supported1099 =
  | Income1099Int
  | Income1099B
  | Income1099Div
  | Income1099R
  | Income1099SSA

export enum PropertyType {
  singleFamily,
  multiFamily,
  vacation,
  commercial,
  land,
  selfRental,
  other
}

export type PropertyTypeName = keyof typeof PropertyType

export enum PropertyExpenseType {
  advertising,
  auto,
  cleaning,
  commissions,
  insurance,
  legal,
  management,
  mortgage,
  otherInterest,
  repairs,
  supplies,
  taxes,
  utilities,
  depreciation,
  other
}

export type PropertyExpenseTypeName = keyof typeof PropertyExpenseType

export interface Property {
  address: Address
  rentalDays: number
  personalUseDays: number
  rentReceived: number
  propertyType: PropertyTypeName
  otherPropertyType?: string
  qualifiedJointVenture: boolean
  expenses: Partial<{ [K in PropertyExpenseTypeName]: number }>
  otherExpenseType?: string
}

export interface F1098e {
  lender: string
  interest: number
}

export type State =
  | 'AL'
  | 'AK'
  | 'AZ'
  | 'CO'
  | 'DC'
  | 'FL'
  | 'HI'
  | 'ID'
  | 'IN'
  | 'KY'
  | 'MA'
  | 'ME'
  | 'MN'
  | 'MS'
  | 'NC'
  | 'NE'
  | 'NJ'
  | 'NV'
  | 'OH'
  | 'OR'
  | 'RI'
  | 'SD'
  | 'TX'
  | 'VA'
  | 'WA'
  | 'WV'
  | 'AR'
  | 'CA'
  | 'CT'
  | 'DE'
  | 'GA'
  | 'IA'
  | 'IL'
  | 'KS'
  | 'LA'
  | 'MD'
  | 'MI'
  | 'MO'
  | 'MT'
  | 'ND'
  | 'NH'
  | 'NM'
  | 'NY'
  | 'OK'
  | 'PA'
  | 'SC'
  | 'TN'
  | 'UT'
  | 'VT'
  | 'WI'
  | 'WY'

// Hold information about state residency
// TODO: Support part-year state residency
export interface StateResidency {
  state: State
}

export interface Information {
  f1099s: Supported1099[]
  w2s: IncomeW2[]
  realEstate: Property[]
  estimatedTaxes: EstimatedTaxPayments[]
  f1098es: F1098e[]
  refund?: Refund
  taxPayer: TaxPayer
  questions: Responses
  stateResidencies: StateResidency[]
}

export enum TaxYears {
  Y2019 = 'Y2019',
  Y2020 = 'Y2020',
  Y2021 = 'Y2021'
}

export type TaxYear = keyof typeof TaxYears

export type TaxesState = Partial<{ [K in TaxYear]: Information }> & {
  activeYear: TaxYear
}

export interface ArrayItemEditAction<A> {
  index: number
  value: A
}

export type EditDependentAction = ArrayItemEditAction<Dependent>
export type EditW2Action = ArrayItemEditAction<IncomeW2>
export type EditEstimatedTaxesAction = ArrayItemEditAction<EstimatedTaxPayments>
export type Edit1099Action = ArrayItemEditAction<Supported1099>
export type EditPropertyAction = ArrayItemEditAction<Property>
export type Edit1098eAction = ArrayItemEditAction<F1098e>
