import { enumKeys } from '../util'

export enum TaxYears {
  Y2019 = 2019,
  Y2020 = 2020,
  Y2021 = 2021
}

export type TaxYear = keyof typeof TaxYears

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
  ssWages: number
  ssWithholding: number
  medicareWithholding: number
  employer?: Employer
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  state?: State
  stateWages?: number
  stateWithholding?: number
  box12?: W2Box12Info
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
  totalCapitalGainsDistributions: number
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
  // IRA = 'IRA',
  // RothIRA = 'RothIRA',
  // SepIRA = 'SepIRA',
  // SimpleIRA = 'SimpleIRA',
  /* Pension and annuity payments include distributions from 401(k), 403(b), and governmental 457(b) plans.
   */
  Pension = 'Pension'
}

export const PlanType1099Texts = {
  // [PlanType1099.IRA]:'traditional IRA',
  // [PlanType1099.RothIRA]: 'Roth IRA',
  // [PlanType1099.SepIRA]: 'simplified employee pension (SEP) IRA',
  // [PlanType1099.SimpleIRA]: 'savings incentive match plan for employees (SIMPLE) IRA',
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
export enum W2Box12Code {
  A = 'A', // Uncollected social security or RRTA tax on tips.
  B = 'B', // Uncollected Medicare tax on tips.
  C = 'C', // Taxable cost of group-term life insurance over $50,000.
  D = 'D', // Elective deferrals under a section 401(k) cash or deferred arrangement (plan).
  E = 'E', // Elective deferrals under a section 403(b) salary reduction agreement.
  F = 'F', // Elective deferrals under a section 408(k)(6) salary reduction SEP.
  G = 'G', // Elective deferrals and employer contributions (including nonelective deferrals) to any governmental or nongovernmental section 457(b) deferred compensation plan.
  H = 'H', // Elective deferrals under section 501(c)(18)(D) tax-exempt organization plan.
  J = 'J', // Nontaxable sick pay.
  K = 'K', // 20% excise tax on excess golden parachute payments (not applicable to Forms W-2AS, W-2CM, W-2GU, or W-2VI).
  L = 'L', // Substantiated employee business expense reimbursements.
  M = 'M', // Uncollected social security or RRTA tax on taxable cost of group-term life insurance over $50,000 (for former employees).
  N = 'N', // Uncollected Medicare tax on taxable cost of group-term life insurance over $50,000 (for former employees).
  P = 'P', // Excludable moving expense reimbursements paid directly to a member of the U.S. Armed Forces.
  Q = 'Q', // Nontaxable combat pay.
  R = 'R', // Employer contributions to an Archer MSA.
  S = 'S', // Employee salary reduction contributions under a section 408(p) SIMPLE plan.
  T = 'T', // Adoption benefits.
  V = 'V', // Income from the exercise of nonstatutory stock option(s).
  W = 'W', // Employer contributions to a health savings account (HSA).
  Y = 'Y', // Deferrals under a section 409A nonqualified deferred compensation plan.
  Z = 'Z', // Income under a nonqualified deferred compensation plan that fails to satisfy section 409A.
  AA = 'AA', // Designated Roth contributions under a section 401(k) plan.
  BB = 'BB', // Designated Roth contributions under a section 403(b) plan.
  DD = 'DD', // Cost of employer-sponsored health coverage.
  EE = 'EE', // Designated Roth contributions under a governmental section 457(b) plan.
  FF = 'FF', // Permitted benefits under a qualified small employer health reimbursement arrangement.
  GG = 'GG', // Income from qualified equity grants under section 83(i).
  HH = 'HH' // Aggregate deferrals under section 83(i) elections as of the close of the calendar year.}
}

export const W2Box12CodeDescriptions: { [key in W2Box12Code]: string } = {
  A: 'Uncollected social security or RRTA tax on tips.',
  B: 'Uncollected Medicare tax on tips.',
  C: 'Taxable cost of group-term life insurance over $50,000.',
  D: 'Elective deferrals under a section 401(k) cash or deferred arrangement plan.',
  E: 'Elective deferrals under a section 403(b) salary reduction agreement.',
  F: 'Elective deferrals under a section 408(k)(6) salary reduction SEP.',
  G: 'Elective deferrals and employer contributions (including nonelective deferrals) to any governmental or nongovernmental section 457(b) deferred compensation plan.',
  H: 'Elective deferrals under section 501(c)(18)(D) tax-exempt organization plan.',
  J: 'Nontaxable sick pay.',
  K: '20% excise tax on excess golden parachute payments (not applicable to Forms W-2AS, W-2CM, W-2GU, or W-2VI).',
  L: 'Substantiated employee business expense reimbursements.',
  M: 'Uncollected social security or RRTA tax on taxable cost of group-term life insurance over $50,000 (for former employees).',
  N: 'Uncollected Medicare tax on taxable cost of group-term life insurance over $50,000 (for former employees).',
  P: 'Excludable moving expense reimbursements paid directly to a member of the U.S. Armed Forces.',
  Q: 'Nontaxable combat pay.',
  R: 'Employer contributions to an Archer MSA.',
  S: 'Employee salary reduction contributions under a section 408(p) SIMPLE plan.',
  T: 'Adoption benefits.',
  V: 'Income from the exercise of nonstatutory stock option(s).',
  W: 'Employer contributions to a health savings account (HSA).',
  Y: 'Deferrals under a section 409A nonqualified deferred compensation plan.',
  Z: 'Income under a nonqualified deferred compensation plan that fails to satisfy section 409A.',
  AA: 'Designated Roth contributions under a section 401(k) plan.',
  BB: 'Designated Roth contributions under a section 403(b) plan.',
  DD: 'Cost of employer-sponsored health coverage.',
  EE: 'Designated Roth contributions under a governmental section 457(b) plan.',
  FF: 'Permitted benefits under a qualified small employer health reimbursement arrangement.',
  GG: 'Income from qualified equity grants under section 83(i).',
  HH: 'Aggregate deferrals under section 83(i) elections as of the close of the calendar year.'
}

export type W2Box12Info<A = number> = { [key in W2Box12Code]?: A }

export interface HealthSavingsAccount<DateType = string> {
  label: string
  coverageType: 'self-only' | 'family'
  contributions: number
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  startDate: DateType
  endDate: DateType
  totalDistributions: number
  qualifiedDistributions: number
}

export enum IraPlanType {
  IRA = 'IRA',
  RothIRA = 'RothIRA',
  SepIRA = 'SepIRA',
  SimpleIRA = 'SimpleIRA'
}

export const IraPlanTypeTexts = {
  [IraPlanType.IRA]: 'Traditional IRA',
  [IraPlanType.RothIRA]: 'Roth IRA',
  [IraPlanType.SepIRA]: 'Simplified employee pension (SEP) IRA',
  [IraPlanType.SimpleIRA]:
    'Savings incentive match plan for employees (SIMPLE) IRA'
}

export type IraPlanName = keyof typeof IraPlanType

export const iraPlanNames: IraPlanName[] = enumKeys(IraPlanType)
// export const iraPlanNames: IraPlanName[] = [
//   'IRA',
//   'RothIRA',
//   'SepIRA',
//   'SimpleIRA'
// ]

export interface Ira {
  payer: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  // fields about distributions from form 1099-R
  grossDistribution: number // 1099-R box 1
  taxableAmount: number // 1099-R box 2a
  taxableAmountNotDetermined: boolean // 1099-R box 2b
  totalDistribution: boolean // 1099-R box 2b
  federalIncomeTaxWithheld: number // 1099-R box 4
  planType: IraPlanType
  // fields about contributions from form 5498
  contributions: number // contributions depending on the plan type
  rolloverContributions: number // 5498 box 2
  rothIraConversion: number // 5498 box 3
  recharacterizedContributions: number // 5498 box 4
  requiredMinimumDistributions: number // 5498 box 12b
  lateContributions: number // 5498 box 13a
  repayments: number // 5498 box 14a
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
    spouseStatuses = [FilingStatus.S, FilingStatus.W]
  }
  return [...spouseStatuses, ...withDependents]
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

export interface F3921 {
  name: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  exercisePricePerShare: number
  fmv: number
  numShares: number
}

// See https://www.irs.gov/instructions/i1065sk1
export interface ScheduleK1Form1065 {
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  partnershipName: string
  partnershipEin: string
  partnerOrSCorp: 'P' | 'S'
  isForeign: boolean
  isPassive: boolean
  ordinaryBusinessIncome: number // Schedule E (Form 1040), line 28, column (i) or (k).
  interestIncome: number // Form 1040, line 2b
  guaranteedPaymentsForServices: number // Schedule E (Form 1040), line 28, column (k)
  guaranteedPaymentsForCapital: number // Schedule E (Form 1040), line 28, column (k)
  selfEmploymentEarningsA: number // Schedule SE (Form 1040)
  selfEmploymentEarningsB: number // Schedule SE (Form 1040)
  selfEmploymentEarningsC: number // Schedule SE (Form 1040)
  distributionsCodeAAmount: number // If the amount shown as code A exceeds the adjusted basis of your partnership interest immediately before the distribution, the excess is treated as gain from the sale or exchange of your partnership interest. Generally, this gain is treated as gain from the sale of a capital asset and should be reported on Form 8949 and the Schedule D for your return.
  section199AQBI: number // Form 8995 or 8995-A
}

export interface ItemizedDeductions {
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

// Defines usable tag names for each question later defined,
// and maps to a type which is the expected response type.
export interface QuestionTag {
  CRYPTO: boolean
  FOREIGN_ACCOUNT_EXISTS: boolean
  FINCEN_114: boolean
  FINCEN_114_ACCOUNT_COUNTRY: string
  FOREIGN_TRUST_RELATIONSHIP: boolean
  LIVE_APART_FROM_SPOUSE: boolean
}

export type QuestionTagName = keyof QuestionTag

// Typescript provides no way to access
// keys of an interface at runtime.
export const questionTagNames: QuestionTagName[] = [
  'CRYPTO',
  'FOREIGN_ACCOUNT_EXISTS',
  'FINCEN_114',
  'FINCEN_114_ACCOUNT_COUNTRY',
  'FOREIGN_TRUST_RELATIONSHIP',
  'LIVE_APART_FROM_SPOUSE'
]

export type ValueTag = 'string' | 'boolean'

export type Responses = Partial<QuestionTag> // Defines usable tag names for each question later defined,

export interface Information {
  f1099s: Supported1099[]
  w2s: IncomeW2[]
  realEstate: Property[]
  estimatedTaxes: EstimatedTaxPayments[]
  f1098es: F1098e[]
  f3921s: F3921[]
  scheduleK1Form1065s: ScheduleK1Form1065[]
  itemizedDeductions: ItemizedDeductions | undefined
  refund?: Refund
  taxPayer: TaxPayer
  questions: Responses
  stateResidencies: StateResidency[]
  healthSavingsAccounts: HealthSavingsAccount[]
  individualRetirementArrangements: Ira[]
}

/**
 * An asset can be anything that is transactable, such as a stock,
 * bond, mutual fund, real estate, or cryptocurrency, which is not reported
 * on 1099-B. A position always has an open date. A position may
 * be sold, at which time its gain or loss will be reported,
 * or it may be gifted to another person, at which time its
 * gain or loss will not be reported.
 *
 * An asset can be carried across multiple tax years,
 * so it should not be a sibling rather than a member of `Information`.
 *
 * If a position is real estate, then it has a state, which will
 * require state apportionment.
 *
 * "Closing an asset" can result in a long-term or short-term capital
 * gain. An asset is closed when it gets a closeDate.
 */
export type AssetType = 'Security' | 'Real Estate'
export interface Asset<DateType = Date> {
  name: string
  positionType: AssetType
  openDate: DateType
  closeDate?: DateType
  giftedDate?: DateType
  openPrice: number
  openFee: number
  closePrice?: number
  closeFee?: number
  quantity: number
  state?: State
}

export type AssetString = Asset<string>

// Validated action types:

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
export type EditHSAAction = ArrayItemEditAction<HealthSavingsAccount>
export type EditIraAction = ArrayItemEditAction<Ira>
export type EditAssetAction = ArrayItemEditAction<Asset<Date>>
export type EditF3921Action = ArrayItemEditAction<F3921>
export type EditScheduleK1Form1065Action =
  ArrayItemEditAction<ScheduleK1Form1065>
