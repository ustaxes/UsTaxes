import { enumKeys } from '../util'

export enum TaxYears {
  Y2019 = 2019,
  Y2020 = 2020,
  Y2021 = 2021,
  Y2022 = 2022,
  Y2023 = 2023,
  Y2024 = 2024,
  Y2025 = 2025
}

export type TaxYear = keyof typeof TaxYears

export enum PersonRole {
  PRIMARY = 'PRIMARY',
  SPOUSE = 'SPOUSE',
  DEPENDENT = 'DEPENDENT',
  EMPLOYER = 'EMPLOYER'
}

/**
 * Types such as the following are generic with respect to the Date
 * type. AJV tests the typed serialization of these interfaces
 * in JSON, and Date is not a valid type in JSON. So when our data
 * is serialized in and out of local storage, or to a JSON file,
 * these data must be parsed / serialized from / to strings.
 *
 * Our AJV schema generator ignores generic types.
 */
export interface Person<D = Date> {
  firstName: string
  lastName: string
  ssid: string
  role: PersonRole
  isBlind: boolean
  dateOfBirth: D
}

// Concrete type for our AJV schema generator.
export type PersonDateString = Person<string>

export interface QualifyingInformation {
  numberOfMonths: number
  isStudent: boolean
}

export interface Dependent<D = Date> extends Person<D> {
  relationship: string
  qualifyingInfo?: QualifyingInformation
}

export type DependentDateString = Dependent<string>

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

export interface PrimaryPerson<D = Date> extends Person<D> {
  address: Address
  isTaxpayerDependent: boolean
}
export type PrimaryPersonDateString = PrimaryPerson<string>

export interface Spouse<D = Date> extends Person<D> {
  isTaxpayerDependent: boolean
}

export type SpouseDateString = Spouse<string>

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
  /** W-2 Box 10: Dependent care benefits provided by employer. */
  box10DependentCare?: number
  ssWithholding: number
  medicareWithholding: number
  employer?: Employer
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  state?: State
  stateWages?: number
  stateWithholding?: number
  box12?: W2Box12Info
  /**
   * Railroad Retirement Tax Act (RRTA) compensation (W-2 box 14 coded "RRTA
   * compensation"). For railroad workers only. Flows to Form 8959 Part III
   * line 14 to determine Additional Medicare Tax on RRTA wages.
   */
  rrtaCompensation?: number
  /**
   * Additional Medicare Tax withheld on RRTA compensation (W-2 box 14 coded
   * "RRTA Med"). Flows to Form 8959 line 23 (withholding reconciliation).
   */
  rrtaWithholding?: number
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
  /**
   * Specified private activity bond interest (1099-INT box 9).
   * Flows to Form 6251 line 2g for AMT.
   */
  specifiedPrivateActivityBondInterest?: number
}

export interface F1099DivData {
  dividends: number
  qualifiedDividends: number
  totalCapitalGainsDistributions: number
  /**
   * Specified private activity bond interest dividends (1099-DIV box 6).
   * Flows to Form 6251 line 2g for AMT.
   */
  specifiedPrivateActivityBondInterest?: number
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
  RothIRA = 'RothIRA',
  SepIRA = 'SepIRA',
  SimpleIRA = 'SimpleIRA',
  // Pension and annuity payments include distributions from 401(k), 403(b), and governmental 457(b) plans.
  Pension = 'Pension',
  /**
   * Commercial / non-qualified annuity — distributions from insurance-company
   * annuity contracts not held inside a qualified retirement plan or IRA.
   * These are subject to Net Investment Income Tax (NIIT) and are reported
   * on 1099-R with box 7 code "D".  Use this plan type when the payor's
   * 1099-R box 7 shows code D and the annuity is NOT from a qualified plan,
   * IRA, 403(b), or governmental 457(b).
   */
  Annuity = 'Annuity'
}

export const PlanType1099Texts: { [k in keyof typeof PlanType1099]: string } = {
  IRA: 'traditional IRA',
  RothIRA: 'Roth IRA',
  SepIRA: 'simplified employee pension (SEP) IRA',
  SimpleIRA: 'savings incentive match plan for employees (SIMPLE) IRA',
  Pension: '401(k), 403(b), or 457(b) plan',
  Annuity: 'commercial / non-qualified annuity (1099-R box 7 code D)'
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

export interface HealthSavingsAccount<D = Date> {
  label: string
  coverageType: 'self-only' | 'family'
  contributions: number
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  startDate: D
  endDate: D
  totalDistributions: number
  qualifiedDistributions: number
  /**
   * Archer MSA distributions rolled over into this HSA (Form 8889 line 14b).
   * Reduces the taxable portion of total distributions. Enter the amount
   * rolled over from Form 1099-SA box 4.
   */
  archerMsaRollover?: number
  /**
   * Qualified HSA funding distribution — a direct trustee-to-trustee transfer
   * from a traditional or Roth IRA into this HSA (Form 8889 line 10).
   * Once-per-lifetime election; reduces the IRA-to-HSA rollover limit.
   * The amount reduces the allowable HSA contribution deduction on line 13.
   */
  fundingDistribution?: number
  /**
   * Prior-year last-month rule testing period failure income (Form 8889 line 18).
   * Enter the amount from last year's Form 8889 line 13 if you elected the
   * last-month rule in the prior year but failed to maintain HDHP eligibility
   * throughout the testing period (the full following calendar year).
   * This amount becomes ordinary income and is subject to a 10% additional tax.
   */
  lastMonthRuleTestingFailureIncome?: number
  /**
   * IRA-to-HSA qualified funding distribution testing period failure income
   * (Form 8889 line 19).
   * Enter the amount of a prior qualified HSA funding distribution (from an IRA)
   * if you failed to maintain HDHP eligibility throughout the testing period
   * following that distribution. The failed portion becomes ordinary income
   * subject to a 10% additional tax.
   */
  fundingDistributionTestingFailureIncome?: number
}

export type HealthSavingsAccountDateString = HealthSavingsAccount<string>

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
  /**
   * Amount of the distribution subject to the 10% additional tax (Form 5329).
   * Leave undefined if the distribution qualifies for an exception (age 59½+,
   * disability, death, first home purchase, higher education expenses, etc.).
   */
  earlyWithdrawalAmount?: number
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

export const filingStatuses = <D>(
  p: TaxPayer<D> | undefined
): FilingStatus[] => {
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

export interface TaxPayer<D = Date> extends ContactInfo {
  filingStatus?: FilingStatus
  primaryPerson?: PrimaryPerson<D>
  spouse?: Spouse<D>
  dependents: Dependent<D>[]
}

export type TaxPayerDateString = TaxPayer<string>

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
  /**
   * W-2 wages allocable to the QBI activity (K-1 box 17 code V).
   * Used in the W-2 wage limitation for Form 8995-A lines 4a–4c.
   */
  w2Wages?: number
  /**
   * Unadjusted basis immediately after acquisition of all qualified property
   * (K-1 box 17 code AB). Used in the UBIA limitation for Form 8995-A lines 7a–7c.
   */
  unadjustedBasis?: number
}

/**
 * Self-employment / sole proprietor income (Schedule C).
 * Gross receipts minus total expenses = net profit flowing to Schedule SE.
 */
export interface SelfEmployedIncome {
  businessName?: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  /** Gross receipts / sales (Schedule C line 1). */
  grossReceipts: number
  /** Total deductible business expenses (Schedule C line 28). */
  expenses: number
  /** True if this is statutory employee income (from W-2 box 13). */
  isStatutoryEmployee?: boolean
  /**
   * Contributions to a SEP-IRA or other qualified retirement plan as a
   * self-employed individual (Schedule 1 line 16). Capped at the lesser of
   * 25% of net self-employment earnings or the annual dollar limit.
   */
  sepContributions?: number
  /**
   * Contributions to a SIMPLE-IRA plan as a self-employed individual
   * (Schedule 1 line 16). Included in the line 16 total with SEP.
   */
  simpleContributions?: number
  /**
   * Self-employed health insurance premiums paid for the taxpayer, spouse, and
   * dependents (Schedule 1 line 17). Cannot exceed the net profit from the
   * business generating the coverage.
   */
  healthInsurancePremiums?: number
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

export enum CreditType {
  AdvanceChildTaxCredit = 'CreditType/AdvanceChildTaxCredit',
  /**
   * Residential clean energy property costs (Form 5695 Part I).
   * The `amount` field is the eligible property cost; the credit is 30% of it.
   */
  ResidentialCleanEnergyCost = 'CreditType/ResidentialCleanEnergyCost',
  /**
   * Energy efficient home improvement credit (Form 5695 Part II).
   * The `amount` field is the computed credit (pre-calculated by taxpayer per IRS instructions).
   */
  EnergyEfficientHomeImprovement = 'CreditType/EnergyEfficientHomeImprovement',
  /**
   * Clean vehicle credit (Form 8936).
   * The `amount` field is the credit amount (up to $7,500 per vehicle).
   */
  CleanVehicle = 'CreditType/CleanVehicle',
  /**
   * Alternative motor vehicle credit (Form 8910).
   * The `amount` field is the credit from Form 8910 line 15.
   */
  AlternativeMotorVehicle = 'CreditType/AlternativeMotorVehicle',
  /**
   * Credit for federal tax on fuels (Form 4136).
   * The `amount` field is the total credit from Form 4136.
   */
  FuelTax = 'CreditType/FuelTax',
  /**
   * Undistributed capital gains credit from regulated investment companies (Form 2439).
   * The `amount` field is the credit from Form 2439 box 2.
   */
  UndistributedCapitalGains = 'CreditType/UndistributedCapitalGains',
  Other = 'CreditType/Other'
}

export interface Credit {
  recipient: PersonRole
  amount: number
  type: CreditType
}

/**
 * User-provided AMT preference and adjustment items for Form 6251.
 * These are differences between regular tax and AMT calculations that
 * cannot be derived automatically from other data in the return.
 */
export interface AmtAdjustments {
  /** Line 2c: Investment interest expense (regular tax − AMT amount). */
  investmentInterestExpense?: number
  /** Line 2d: Depletion (regular tax − AMT). */
  depletion?: number
  /** Line 2f: Alternative tax net operating loss deduction (enter as positive; shown as negative on form). */
  atnold?: number
  /** Line 2h: Qualified small business stock preference (7% of section 1202 gain excluded). */
  qualifiedSmallBusinessStock?: number
  /** Line 2j: AMT adjustment from Schedule K-1 (Form 1041) box 12 code A. */
  estatesAndTrustsK1?: number
  /** Line 2k: Disposition of property AMT vs regular tax gain/loss difference. */
  propertyDisposition?: number
  /** Line 2l: Post-1986 depreciation AMT adjustment. */
  depreciation?: number
  /** Line 2m: Passive activities AMT adjustment. */
  passiveActivities?: number
  /** Line 2n: Loss limitations AMT adjustment. */
  lossLimitations?: number
  /** Line 2o: Circulation costs AMT adjustment. */
  circulationCosts?: number
  /** Line 2p: Long-term contracts AMT adjustment. */
  longTermContracts?: number
  /** Line 2q: Mining costs AMT adjustment. */
  miningCosts?: number
  /** Line 2r: Research and experimental costs AMT adjustment. */
  researchAndExperimentalCosts?: number
  /** Line 2s: Pre-1987 installment sale income. */
  installmentSales?: number
  /** Line 2t: Intangible drilling costs preference. */
  intangibleDrillingCosts?: number
  /** Line 3: Other AMT adjustments. */
  otherAdjustments?: number
  /** Line 8: Alternative minimum tax foreign tax credit (enter as positive; subtracted on form). */
  foreignTaxCredit?: number
}

/**
 * Child and dependent care expenses (Form 2441).
 */
export interface DependentCareExpenses {
  /**
   * Number of qualifying persons (children under 13 or disabled dependents).
   * Determines the expense cap ($3,000 for 1, $6,000 for 2+).
   */
  qualifyingPersonCount: number
  /** Total qualified care expenses paid to all providers during the year. */
  totalExpenses: number
}

/**
 * Additional earned income items entered directly by the taxpayer.
 * These flow to F1040 lines 1b–1h and are distinct from W-2 wages.
 */
export interface OtherEarnedIncome {
  /** Household employee wages not reported on W-2 (F1040 line 1b). */
  householdEmployeeWages?: number
  /** Tip income not reported on W-2 box 7 or line 1a (F1040 line 1c). */
  unreportedTips?: number
  /** Medicaid waiver payments not reported on W-2 box 1 (F1040 line 1d). */
  medicaidWaiverPayments?: number
  /**
   * Wages from Form 8919 line 6, for workers whose employer incorrectly
   * treated them as independent contractors (F1040 line 1g).
   */
  form8919Wages?: number
  /** Other earned income not elsewhere classified (F1040 line 1h). */
  otherEarnedIncome?: number
  /**
   * Taxable employer-provided adoption benefits (F1040 line 1f, from Form 8839 line 31).
   * Enter the portion of employer adoption assistance that exceeds the
   * tax-free exclusion limit ($17,280 for 2025 per eligible child).
   * Employer adoption benefits reported in W-2 box 12 code T; the taxable
   * portion after the exclusion flows here via Form 8839.
   */
  employerAdoptionBenefits?: number
}

/**
 * Additional income items that flow to Schedule 1 Part I, and above-the-line
 * adjustments that flow to Schedule 1 Part II.
 */
export interface OtherIncome {
  /** Taxable state and local income tax refunds (Schedule 1 line 1). */
  taxableStateLocalRefunds?: number
  /** Alimony received under a pre-2019 divorce/separation agreement (Schedule 1 line 2a). */
  alimonyReceived?: number
  /**
   * Date of the original divorce or separation agreement under which alimony is received.
   * Required when alimonyReceived > 0 (Schedule 1 line 2b).
   */
  alimonyDivorceDate?: string
  /** Unemployment compensation from Form(s) 1099-G (Schedule 1 line 7). */
  unemploymentCompensation?: number
  /** Net operating loss deduction (Schedule 1 line 8a). Enter as negative. */
  netOperatingLoss?: number
  /** Gambling winnings (Schedule 1 line 8b). */
  gamblingWinnings?: number
  /** Cancellation of debt income (Schedule 1 line 8c). */
  cancellationOfDebt?: number
  /**
   * Prizes and awards (Schedule 1 line 8d or 8e, per IRS 2025 Schedule 1).
   * Enter taxable prizes, awards, and taxable scholarships and fellowship grants
   * not reported on W-2 or other information returns.
   */
  prizesAndAwards?: number
  /**
   * Wages received while incarcerated (Schedule 1 line 8h).
   * Include wages, salaries, and other compensation received for services
   * performed while a prisoner in a penal institution.
   */
  wagePaidWhileIncarcerated?: number
  /** Alaska Permanent Fund dividends (Schedule 1 line 8g). */
  alaskaPermanentFund?: number
  /**
   * Jury duty pay (Schedule 1 line 8q or similar).
   * If you turned over jury duty pay to your employer because you continued
   * to receive your regular salary while serving, you can deduct it as an
   * adjustment (line 24a). Enter the gross pay here and the deduction on
   * otherAdjustments.
   */
  juryDutyFees?: number
  /**
   * Other additional taxes (Schedule 2 line 17a).
   * For recapture of credit, mortgage subsidy, etc., not covered by named lines.
   */
  otherAdditionalTaxDescription?: string
  otherAdditionalTax?: number
  /**
   * Other nonrefundable credits (Schedule 3 line 6z).
   * For less-common credits not otherwise supported.
   */
  otherNonrefundableCreditDescription?: string
  otherNonrefundableCredit?: number
  /**
   * Other payments (Schedule 3 line 13z).
   * For less-common refundable credits or payments not otherwise supported.
   */
  otherPaymentDescription?: string
  otherPayment?: number
  /** Royalty income (Schedule E Part I line 4). */
  royaltyIncome?: number
  /**
   * Expenses related to royalty income (Schedule E Part I line 20, royalty column).
   * Enter deductible costs directly associated with producing royalty income
   * (e.g., attorney fees for licensing, agent commissions).
   * Used in Pub 596 Worksheet 1 line 9.
   */
  royaltyExpenses?: number
  /**
   * Other investment expenses allocable to net investment income (Form 8960 line 10).
   * Enter expenses from Schedule A line 23 or other deductible investment
   * expenses not already captured in the NIIT computation.
   */
  otherInvestmentExpenses?: number
  /** Farm rental income or loss (Schedule E line 40, from Form 4835). */
  farmRentalIncome?: number
  /** REMIC residual interest income or loss (Schedule E line 39). */
  remicIncome?: number
  /** Real estate mortgage investment conduit (REMIC) regular interest income (Schedule E line 37). */
  realEstateTrustIncome?: number
  /**
   * Excess advance premium tax credit repayment (Schedule 2 line 1a).
   * Entered directly when F8962 full computation is not available.
   */
  excessAdvancePTC?: number
  /**
   * Repayment of new clean vehicle credit transferred to a dealer (Schedule 2 line 1b).
   * Attach Form 8936 and Schedule A (Form 8936).
   */
  newCleanVehicleCreditRepayment?: number
  /**
   * Repayment of previously owned clean vehicle credit transferred to a dealer (Schedule 2 line 1c).
   * Attach Form 8936 and Schedule A (Form 8936).
   */
  previouslyOwnedCleanVehicleCreditRepayment?: number

  // ── Schedule 1 Part II: Adjustments to income ──────────────────────────

  /**
   * Prior-year disallowed investment interest expense carry-forward (Form 4952 line 2).
   * When investment interest expense from a prior year exceeded net investment income
   * and was disallowed, the disallowed amount carries forward to the current year.
   * Enter the amount from last year's Form 4952 line 4h.
   */
  priorYearInvestmentInterestCarryover?: number

  /**
   * Certain business expenses of reservists, performing artists, and
   * fee-basis state or local government officials (Schedule 1 line 12).
   * Enter the total unreimbursed business expenses from Form 2106 line 10
   * if you are an Armed Forces reservist, a qualified performing artist,
   * or a fee-basis state or local government official.
   * Most employees cannot deduct unreimbursed employee expenses; this
   * above-the-line deduction is available only to these three categories.
   */
  form2106Expenses?: number
  /**
   * Educator expenses paid out-of-pocket for classroom supplies (Schedule 1 line 11).
   * Enter primary taxpayer's amount (capped at $300 per eligible educator).
   * K-12 teachers, instructors, counselors, principals, or aides working ≥900 hours.
   */
  educatorExpenses?: number
  /**
   * Educator expenses for the spouse (Schedule 1 line 11), when filing MFJ and
   * both spouses are eligible educators. Each is capped at $300; combined max $600.
   */
  spouseEducatorExpenses?: number

  /**
   * Penalty on early withdrawal of savings (Schedule 1 line 18).
   * Enter the amount from box 2 of Form 1099-INT or 1099-OID. This is the
   * forfeiture charged by banks for early CD/savings withdrawal, not the
   * 10% penalty on IRA distributions (which is reported on Form 5329).
   */
  earlyWithdrawalPenalty?: number

  /**
   * Deductible traditional IRA contributions (Schedule 1 line 19a).
   * Enter the deductible portion after applying phase-out rules based on
   * MAGI and whether covered by a workplace retirement plan.
   * Roth IRA contributions are never deductible; omit them here.
   */
  iraDeduction?: number

  /**
   * Amount paid with an extension of time to file (Schedule 3 line 10).
   * Enter the amount paid when filing Form 4868 for an automatic 6-month
   * extension. This reduces the balance due or increases the refund.
   */
  extensionPayment?: number
  /**
   * Credit for the elderly or disabled (Schedule R line 22).
   * This is the computed credit from Schedule R. Most taxpayers with
   * significant Social Security income will have this reduced to zero.
   * Enter the final credit amount from the taxpayer's Schedule R.
   */
  elderlyOrDisabledCredit?: number
  /**
   * Foreign Earned Income Exclusion amount (Form 2555, line 45).
   * For U.S. citizens and resident aliens working abroad who qualify under
   * the bona fide residence or physical presence test. The exclusion
   * reduces taxable income but does not reduce self-employment tax.
   * Full Form 2555 computation is not yet implemented; entering this amount
   * enables the FEIE branch in the tax worksheets.
   */
  foreignEarnedIncomeExclusion?: number

  /**
   * Foreign tax credit claimed directly without Form 1116 (Schedule 3 line 1).
   * Allowed when total creditable foreign taxes do not exceed $300 (single) or
   * $600 (married filing jointly) and all foreign income is passive and reported
   * on 1099s. Flows to Schedule 3 line 1.
   */
  foreignTaxCredit?: number
}

/**
 * Education expenses for a single student (Form 8863).
 * Only one credit (AOTC or LLC) can be claimed per student per year.
 */
export interface EducationExpenses {
  /** Student's full name (for identification). */
  studentName: string
  /**
   * Whether this student is claimed as a dependent on this return.
   * AOTC and LLC can be claimed for yourself, your spouse, or a dependent.
   */
  isDependent: boolean
  /**
   * Adjusted qualified education expenses for the American Opportunity Tax
   * Credit (AOTC). Enter tuition, fees, and course materials minus
   * tax-free scholarships, grants, and employer assistance.
   * Credit: 100% of first $2,000 + 25% of next $2,000 = max $2,500/student.
   * Claim this credit only if aotcEligible is true.
   */
  aotcQualifiedExpenses?: number
  /**
   * True when ALL conditions are met for the AOTC:
   * • Student is in their first 4 years of higher education
   * • Enrolled at least half-time for at least one academic period in the year
   * • Has not completed 4 years of higher education before 2025
   * • Has not claimed AOTC (or Hope credit) for 4 prior years
   * • Has no felony drug conviction
   */
  aotcEligible?: boolean
  /**
   * Adjusted qualified education expenses for the Lifetime Learning Credit
   * (LLC). Include tuition and required fees minus tax-free assistance.
   * All students' LLC expenses are pooled; 20% of up to $10,000 total.
   * Cannot be claimed in the same year as AOTC for the same student.
   */
  llcQualifiedExpenses?: number
}

/**
 * A single sale or exchange of business property (Form 4797).
 * Cover Section 1231 transactions (property held more than 1 year used in
 * a trade or business) and other business property dispositions.
 */
export interface BusinessPropertySale {
  /** Description of the property (e.g., "Office building at 123 Main St"). */
  description: string
  /** Date acquired (MM/DD/YYYY). */
  dateAcquired: string
  /** Date sold or otherwise disposed of (MM/DD/YYYY). */
  dateSold: string
  /** Gross sales price or amount realized. */
  grossSalePrice: number
  /** Total depreciation allowed or allowable since acquisition. */
  depreciationAllowed: number
  /** Original cost or adjusted basis. */
  costBasis: number
  /**
   * Additional costs of sale (commissions, closing costs, etc.).
   * Deducted from gross sales price to compute amount realized.
   */
  sellingExpenses?: number
}

/**
 * Monthly data from a single Form 1095-A (Health Insurance Marketplace
 * Statement). Required to compute the Premium Tax Credit on Form 8962.
 * Obtain from your marketplace account or HealthCare.gov annually.
 * Each entry represents one policy / coverage family.
 */
export interface Form1095A {
  /** Optional marketplace policy number (for identification). */
  policyNumber?: string
  /**
   * Monthly enrollment premiums from Form 1095-A column A.
   * Array of 12 values (Jan–Dec); use 0 for months not covered.
   */
  monthlyPremiums: number[]
  /**
   * Second Lowest Cost Silver Plan (SLCSP) premiums from Form 1095-A
   * column B. Array of 12 values. Use the premium for the coverage family
   * (all enrolled family members). Enter 0 for months not enrolled.
   */
  monthlySlcsp: number[]
  /**
   * Advance payments of the Premium Tax Credit from Form 1095-A column C.
   * Array of 12 values. Enter 0 for months with no advance credit paid.
   */
  monthlyAdvancePtc: number[]
}

/**
 * OBBB (One Big Beautiful Bill, 2025) vehicle for the car loan interest deduction.
 * Reported on Schedule 1-A, Page 2.
 */
export interface ObbbCarLoanVehicle {
  vin: string
  /** Date of purchase (MM/DD/YYYY). Required by Schedule 1-A, Page 2. */
  purchaseDate?: string
  interestPaid: number
}

/**
 * OBBB (One Big Beautiful Bill, 2025) above-the-line deductions.
 * Drives Schedule 1-A (f1040s1a).
 *
 * Tips and overtime premium amounts come from W-2 Box 12 totals across all
 * W-2s (aggregate), or can be entered directly here when not on a W-2.
 */
export interface ObbbDeductions {
  qualifiedTips?: number
  qualifiedOvertimePremium?: number
  carLoanVehicles?: ObbbCarLoanVehicle[]
  /**
   * Elect the $1,000 federal Trump Account pilot program contribution for all
   * eligible dependents (born 2025-2028, under 18, US citizen with SSN).
   * Drives Form 4547.
   */
  electTrumpAccountContribution?: boolean
}

export interface Information<D = Date> {
  f1099s: Supported1099[]
  w2s: IncomeW2[]
  realEstate: Property[]
  estimatedTaxes: EstimatedTaxPayments[]
  f1098es: F1098e[]
  f3921s: F3921[]
  scheduleK1Form1065s: ScheduleK1Form1065[]
  itemizedDeductions: ItemizedDeductions | undefined
  refund?: Refund
  taxPayer: TaxPayer<D>
  questions: Responses
  credits: Credit[]
  stateResidencies: StateResidency[]
  healthSavingsAccounts: HealthSavingsAccount<D>[]
  individualRetirementArrangements: Ira[]
  selfEmployedIncome?: SelfEmployedIncome[]
  obbbDeductions?: ObbbDeductions
  /** Additional earned income lines (F1040 lines 1b–1h). */
  otherEarnedIncome?: OtherEarnedIncome
  /** Additional income flowing to Schedule 1 Part I and Schedule 2 Part I. */
  otherIncome?: OtherIncome
  /** Child and dependent care expenses for Form 2441. */
  dependentCareExpenses?: DependentCareExpenses
  /** User-provided AMT preference and adjustment items for Form 6251. */
  amtAdjustments?: AmtAdjustments
  /**
   * Education expenses for Form 8863 (Education Credits).
   * One entry per student. A student may claim AOTC or LLC, not both.
   */
  educationExpenses?: EducationExpenses[]
  /**
   * Sales of business property for Form 4797.
   * Each entry represents a single sale or exchange of property used in a
   * trade or business (Section 1231 transactions, etc.).
   */
  businessPropertySales?: BusinessPropertySale[]
  /**
   * Form 1095-A data from the Health Insurance Marketplace.
   * Required to compute the Premium Tax Credit on Form 8962.
   * Obtain from your marketplace or HealthCare.gov.
   */
  marketplace1095As?: Form1095A[]
  /**
   * Capital loss carryover from prior tax year (Schedule D).
   * Enter as a positive number; it will be applied as a reduction to gains.
   */
  priorYearCapitalLossCarryover?: {
    /** Prior-year short-term capital loss carryover (Schedule D line 4). */
    shortTerm?: number
    /** Prior-year long-term capital loss carryover (Schedule D line 11). */
    longTerm?: number
  }
}

export type InformationDateString = Information<string>

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
export interface Asset<D = Date> {
  name: string
  positionType: AssetType
  openDate: D
  closeDate?: D
  giftedDate?: D
  openPrice: number
  openFee: number
  closePrice?: number
  closeFee?: number
  quantity: number
  state?: State
  /**
   * IRS Form 8949 column (f) adjustment code(s) (e.g. "W" for wash sale, "B"
   * for reported with incorrect basis). Multiple codes can be combined.
   */
  adjustmentCode?: string
  /**
   * IRS Form 8949 column (g) adjustment amount. Positive increases the
   * reported gain; negative decreases it. Used for wash sales, basis
   * corrections, etc.
   */
  adjustmentAmount?: number
  /** True if this is a digital asset (crypto, NFT, etc.) — uses Form 8949 boxes G-L. */
  isDigitalAsset?: boolean
}

export type SoldAsset<D> = Asset<D> & {
  closePrice: number
  closeDate: D
}

export const isSold = <D>(p: Asset<D>): p is SoldAsset<D> => {
  return p.closeDate !== undefined && p.closePrice !== undefined
}

export type AssetString = Asset<string>

// Validated action types:

export interface ArrayItemEditAction<A> {
  index: number
  value: A
}

export type EditDependentAction = ArrayItemEditAction<DependentDateString>
export type EditW2Action = ArrayItemEditAction<IncomeW2>
export type EditEstimatedTaxesAction = ArrayItemEditAction<EstimatedTaxPayments>
export type Edit1099Action = ArrayItemEditAction<Supported1099>
export type EditPropertyAction = ArrayItemEditAction<Property>
export type Edit1098eAction = ArrayItemEditAction<F1098e>
export type EditHSAAction = ArrayItemEditAction<HealthSavingsAccountDateString>
export type EditIraAction = ArrayItemEditAction<Ira>
export type EditAssetAction = ArrayItemEditAction<Asset<Date>>
export type EditF3921Action = ArrayItemEditAction<F3921>
export type EditScheduleK1Form1065Action =
  ArrayItemEditAction<ScheduleK1Form1065>
export type EditCreditAction = ArrayItemEditAction<Credit>
