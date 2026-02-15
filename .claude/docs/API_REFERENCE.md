# API Reference
## UsTaxes - Claude Code Automation Layer

**Version:** 1.0.0
**Last Updated:** 2025-11-27
**Tax Years Supported:** 2019-2024

---

## Table of Contents

1. [Overview](#overview)
2. [TypeScript Interfaces](#typescript-interfaces)
3. [Redux Actions API](#redux-actions-api)
4. [Validation Functions](#validation-functions)
5. [Tax Calculation Functions](#tax-calculation-functions)
6. [Form Generation API](#form-generation-api)
7. [MCP Server Tools](#mcp-server-tools)
8. [Utilities and Helpers](#utilities-and-helpers)
9. [Complete Examples](#complete-examples)

---

## Overview

This document provides complete TypeScript type definitions and API documentation for programmatically interacting with UsTaxes through the Claude Code automation layer.

### Import Patterns

```typescript
// Redux actions
import * as actions from 'src/redux/actions'

// Data types
import * as types from 'ustaxes/core/data'

// Validators
import * as validators from 'ustaxes/core/data/validate'

// Form generation
import { create1040, create1040PDFs } from 'src/forms/Y2024/irsForms'
```

---

## TypeScript Interfaces

### Core Person Types

#### Person

Base interface for all persons in the tax return.

```typescript
interface Person<D = Date> {
  firstName: string
  lastName: string
  ssid: string              // SSN format: XXX-XX-XXXX
  role: PersonRole
  isBlind: boolean
  dateOfBirth: D            // Generic: Date or string
}

enum PersonRole {
  PRIMARY = 'PRIMARY',
  SPOUSE = 'SPOUSE',
  DEPENDENT = 'DEPENDENT',
  EMPLOYER = 'EMPLOYER'
}

// For JSON serialization (localStorage, MCP)
type PersonDateString = Person<string>
```

**Usage:**
```typescript
const taxpayer: Person = {
  firstName: 'John',
  lastName: 'Doe',
  ssid: '123-45-6789',
  role: PersonRole.PRIMARY,
  isBlind: false,
  dateOfBirth: new Date('1985-06-15')
}
```

#### PrimaryPerson

The primary taxpayer with address information.

```typescript
interface PrimaryPerson<D = Date> extends Person<D> {
  address: Address
  isTaxpayerDependent: boolean  // Can be claimed by someone else
}

type PrimaryPersonDateString = PrimaryPerson<string>
```

#### Spouse

```typescript
interface Spouse<D = Date> extends Person<D> {
  isTaxpayerDependent: boolean
}

type SpouseDateString = Spouse<string>
```

#### Dependent

```typescript
interface Dependent<D = Date> extends Person<D> {
  relationship: string            // "Son", "Daughter", etc.
  qualifyingInfo?: QualifyingInformation
}

interface QualifyingInformation {
  numberOfMonths: number          // 1-12 months lived with taxpayer
  isStudent: boolean              // Full-time student
}

type DependentDateString = Dependent<string>
```

**Usage:**
```typescript
const child: Dependent = {
  firstName: 'Emily',
  lastName: 'Doe',
  ssid: '987-65-4321',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: new Date('2015-03-20'),
  relationship: 'Daughter',
  qualifyingInfo: {
    numberOfMonths: 12,
    isStudent: false
  }
}
```

### Address Types

```typescript
interface Address {
  address: string               // Street address
  aptNo?: string               // Apartment/unit number
  city: string
  state?: State                // US state (see State enum)
  zip?: string                 // ZIP code
  foreignCountry?: string      // For international addresses
  province?: string            // For international addresses
  postalCode?: string          // For international addresses
}
```

**Usage:**
```typescript
const address: Address = {
  address: '123 Main Street',
  aptNo: 'Apt 4B',
  city: 'New York',
  state: 'NY',
  zip: '10001'
}
```

### Income Types

#### IncomeW2

W-2 wage and tax statement.

```typescript
interface IncomeW2 {
  occupation: string
  income: number                  // Box 1: Wages, tips, other compensation
  medicareIncome: number          // Box 5: Medicare wages and tips
  fedWithholding: number          // Box 2: Federal income tax withheld
  ssWages: number                 // Box 3: Social security wages
  ssWithholding: number           // Box 4: Social security tax withheld
  medicareWithholding: number     // Box 6: Medicare tax withheld
  employer?: Employer
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  state?: State                   // State tax information
  stateWages?: number             // Box 16
  stateWithholding?: number       // Box 17
  box12?: W2Box12Info            // Box 12 codes (retirement, etc.)
}

interface Employer {
  EIN?: string                    // XX-XXXXXXX format
  employerName?: string
  address?: Address
}

// Box 12 codes and amounts
type W2Box12Info<A = number> = { [key in W2Box12Code]?: A }

enum W2Box12Code {
  D = 'D',    // 401(k) contributions
  DD = 'DD',  // Health insurance cost
  W = 'W',    // HSA employer contributions
  // ... see full enum for all codes
}
```

**Usage:**
```typescript
const w2: IncomeW2 = {
  occupation: 'Software Engineer',
  income: 85000,
  medicareIncome: 85000,
  fedWithholding: 12750,
  ssWages: 85000,
  ssWithholding: 5270,
  medicareWithholding: 1232.50,
  employer: {
    EIN: '12-3456789',
    employerName: 'Acme Corp',
    address: {
      address: '456 Business Blvd',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    }
  },
  personRole: PersonRole.PRIMARY,
  box12: {
    D: 5000,    // $5,000 in 401(k) contributions
    DD: 12000   // $12,000 health insurance value
  }
}
```

#### 1099 Forms

```typescript
// Union type for all supported 1099s
type Supported1099 =
  | Income1099Int
  | Income1099B
  | Income1099Div
  | Income1099R
  | Income1099SSA

// Base 1099 interface
interface Income1099<T, D> {
  payer: string
  type: T
  form: D
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}

// 1099-INT: Interest income
interface Income1099Int extends Income1099<Income1099Type.INT, F1099IntData> {}

interface F1099IntData {
  income: number              // Box 1: Interest income
}

// 1099-DIV: Dividends
interface Income1099Div extends Income1099<Income1099Type.DIV, F1099DivData> {}

interface F1099DivData {
  dividends: number                      // Box 1a: Total ordinary dividends
  qualifiedDividends: number             // Box 1b: Qualified dividends
  totalCapitalGainsDistributions: number // Box 2a: Total capital gain distributions
}

// 1099-B: Proceeds from broker transactions
interface Income1099B extends Income1099<Income1099Type.B, F1099BData> {}

interface F1099BData {
  shortTermProceeds: number
  shortTermCostBasis: number
  longTermProceeds: number
  longTermCostBasis: number
}

// 1099-R: Distributions from pensions, annuities, IRAs
interface Income1099R extends Income1099<Income1099Type.R, F1099RData> {}

interface F1099RData {
  grossDistribution: number              // Box 1
  taxableAmount: number                  // Box 2a
  federalIncomeTaxWithheld: number       // Box 4
  planType: PlanType1099
}

enum PlanType1099 {
  IRA = 'IRA',
  RothIRA = 'RothIRA',
  SepIRA = 'SepIRA',
  SimpleIRA = 'SimpleIRA',
  Pension = 'Pension'
}
```

**Usage:**
```typescript
// 1099-INT
const interest1099: Income1099Int = {
  payer: 'Chase Bank',
  type: Income1099Type.INT,
  form: { income: 1234.56 },
  personRole: PersonRole.PRIMARY
}

// 1099-DIV
const dividend1099: Income1099Div = {
  payer: 'Vanguard',
  type: Income1099Type.DIV,
  form: {
    dividends: 5000,
    qualifiedDividends: 4500,
    totalCapitalGainsDistributions: 1200
  },
  personRole: PersonRole.PRIMARY
}
```

### Deduction Types

#### ItemizedDeductions

```typescript
interface ItemizedDeductions {
  medicalAndDental?: number           // Schedule A line 1
  stateAndLocalTaxes?: number         // Schedule A line 5 (max $10,000)
  homeMortgageInterest?: number       // Schedule A line 8
  charitableDonations?: number        // Schedule A line 11
  casualtyAndTheftLosses?: number     // Schedule A line 15
  otherItemizedDeductions?: number    // Schedule A line 16
}
```

**Usage:**
```typescript
const itemized: ItemizedDeductions = {
  medicalAndDental: 8500,
  stateAndLocalTaxes: 10000,      // Capped at $10K
  homeMortgageInterest: 15000,
  charitableDonations: 5000
}

// Total itemized: $38,500
// Compare to standard deduction ($14,600 single for 2024)
```

#### F1098e - Student Loan Interest

```typescript
interface F1098e {
  lender: string
  interest: number              // Box 1: Student loan interest paid
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
}
```

**Usage:**
```typescript
const studentLoan: F1098e = {
  lender: 'Sallie Mae',
  interest: 2500,              // Max deduction: $2,500
  personRole: PersonRole.PRIMARY
}
```

### Retirement Accounts

#### HealthSavingsAccount (HSA)

```typescript
interface HealthSavingsAccount<D = Date> {
  label: string
  coverageType: 'self-only' | 'family'
  contributions: number                    // Your contributions
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE
  startDate: D                            // Coverage start
  endDate: D                              // Coverage end
  totalDistributions: number              // Withdrawals
  qualifiedDistributions: number          // Medical expenses
}

type HealthSavingsAccountDateString = HealthSavingsAccount<string>
```

**Usage:**
```typescript
const hsa: HealthSavingsAccount = {
  label: 'My HSA',
  coverageType: 'family',
  contributions: 7500,        // 2024 family limit: $8,300
  personRole: PersonRole.PRIMARY,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-12-31'),
  totalDistributions: 3000,
  qualifiedDistributions: 3000  // All for medical
}
```

#### Ira - Individual Retirement Account

```typescript
interface Ira {
  payer: string
  personRole: PersonRole.PRIMARY | PersonRole.SPOUSE

  // Distribution information (from 1099-R)
  grossDistribution: number                // Box 1
  taxableAmount: number                    // Box 2a
  taxableAmountNotDetermined: boolean      // Box 2b checkbox
  totalDistribution: boolean               // Box 2b checkbox
  federalIncomeTaxWithheld: number        // Box 4
  planType: IraPlanType

  // Contribution information (from Form 5498)
  contributions: number                    // Box 1
  rolloverContributions: number           // Box 2
  rothIraConversion: number               // Box 3
  recharacterizedContributions: number    // Box 4
  requiredMinimumDistributions: number    // Box 12b
  lateContributions: number               // Box 13a
  repayments: number                      // Box 14a
}

enum IraPlanType {
  IRA = 'IRA',                  // Traditional IRA
  RothIRA = 'RothIRA',
  SepIRA = 'SepIRA',
  SimpleIRA = 'SimpleIRA'
}
```

**Usage:**
```typescript
const traditionalIra: Ira = {
  payer: 'Fidelity',
  personRole: PersonRole.PRIMARY,
  grossDistribution: 0,
  taxableAmount: 0,
  taxableAmountNotDetermined: false,
  totalDistribution: false,
  federalIncomeTaxWithheld: 0,
  planType: IraPlanType.IRA,
  contributions: 6500,         // 2024 limit: $7,000 ($8,000 if 50+)
  rolloverContributions: 0,
  rothIraConversion: 0,
  recharacterizedContributions: 0,
  requiredMinimumDistributions: 0,
  lateContributions: 0,
  repayments: 0
}
```

### Filing Information

#### FilingStatus

```typescript
enum FilingStatus {
  S = 'S',          // Single
  MFJ = 'MFJ',      // Married Filing Jointly
  MFS = 'MFS',      // Married Filing Separately
  HOH = 'HOH',      // Head of Household
  W = 'W'           // Qualifying Widow(er)
}

const FilingStatusTexts = {
  [FilingStatus.S]: 'Single',
  [FilingStatus.MFJ]: 'Married Filing Jointly',
  [FilingStatus.MFS]: 'Married Filing Separately',
  [FilingStatus.HOH]: 'Head of Household',
  [FilingStatus.W]: 'Widow(er)'
}
```

#### ContactInfo

```typescript
interface ContactInfo {
  contactPhoneNumber?: string
  contactEmail?: string
}
```

#### Refund

Direct deposit information for refunds.

```typescript
interface Refund {
  routingNumber: string         // 9 digits
  accountNumber: string
  accountType: AccountType
}

enum AccountType {
  checking = 'checking',
  savings = 'savings'
}
```

**Usage:**
```typescript
const refund: Refund = {
  routingNumber: '123456789',
  accountNumber: '9876543210',
  accountType: AccountType.checking
}
```

### Complete Information Structure

#### Information

The complete state for a single tax year.

```typescript
interface Information<D = Date> {
  taxPayer: TaxPayer<D>
  w2s: IncomeW2[]
  f1099s: Supported1099[]
  realEstate: Property[]
  f1098es: F1098e[]
  itemizedDeductions?: ItemizedDeductions
  credits: Credit[]
  healthSavingsAccounts: HealthSavingsAccount<D>[]
  individualRetirementArrangements: Ira[]
  questions: Responses
  refund?: Refund
  estimatedTaxes: EstimatedTaxPayments[]
  f3921s: F3921[]
  scheduleK1Form1065s: ScheduleK1Form1065[]
}

interface TaxPayer<D = Date> {
  primaryPerson?: PrimaryPerson<D>
  spouse?: Spouse<D>
  dependents: Dependent<D>[]
  contactInfo?: ContactInfo
  filingStatus?: FilingStatus
  stateResidency?: StateResidency
}

interface Responses {
  [key: string]: boolean
}

type InformationDateString = Information<string>
```

---

## Redux Actions API

All Redux actions follow a consistent pattern: create, edit, and remove operations for each data type.

### Action Creators

#### Personal Information

```typescript
// Primary taxpayer
function savePrimaryPersonInfo(person: PrimaryPersonDateString): Action

// Spouse
function addSpouse(spouse: SpouseDateString): Action
function removeSpouse(): Action

// Dependents
function addDependent(dependent: DependentDateString): Action
function editDependent(action: EditDependentAction): Action
function removeDependent(index: number): Action

interface EditDependentAction {
  index: number
  value: DependentDateString
}

// Contact and filing status
function saveContactInfo(info: ContactInfo): Action
function saveFilingStatusInfo(status: FilingStatus): Action
function saveStateResidency(residency: StateResidency): Action
```

**Usage Example:**
```typescript
import { savePrimaryPersonInfo, addDependent } from 'src/redux/actions'

// Add primary taxpayer
dispatch(savePrimaryPersonInfo({
  firstName: 'Jane',
  lastName: 'Smith',
  ssid: '123-45-6789',
  role: PersonRole.PRIMARY,
  isBlind: false,
  dateOfBirth: '1985-04-15',  // ISO string for Redux
  address: {
    address: '789 Oak Ave',
    city: 'Seattle',
    state: 'WA',
    zip: '98101'
  },
  isTaxpayerDependent: false
}))

// Add dependent
dispatch(addDependent({
  firstName: 'Tommy',
  lastName: 'Smith',
  ssid: '987-65-4321',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: '2018-09-20',
  relationship: 'Son',
  qualifyingInfo: {
    numberOfMonths: 12,
    isStudent: false
  }
}))
```

#### Income Actions

```typescript
// W-2 income
function addW2(w2: IncomeW2): Action
function editW2(action: EditW2Action): Action
function removeW2(index: number): Action

interface EditW2Action {
  index: number
  value: IncomeW2
}

// 1099 forms
function add1099(form: Supported1099): Action
function edit1099(action: Edit1099Action): Action
function remove1099(index: number): Action

interface Edit1099Action {
  index: number
  value: Supported1099
}
```

**Usage Example:**
```typescript
import { addW2, add1099 } from 'src/redux/actions'

// Add W-2
dispatch(addW2({
  occupation: 'Teacher',
  income: 55000,
  medicareIncome: 55000,
  fedWithholding: 6600,
  ssWages: 55000,
  ssWithholding: 3410,
  medicareWithholding: 797.50,
  employer: {
    EIN: '98-7654321',
    employerName: 'Seattle Public Schools'
  },
  personRole: PersonRole.PRIMARY
}))

// Add 1099-INT
dispatch(add1099({
  payer: 'Wells Fargo',
  type: Income1099Type.INT,
  form: { income: 543.21 },
  personRole: PersonRole.PRIMARY
}))
```

#### Deduction Actions

```typescript
// Itemized deductions
function setItemizedDeductions(deductions: ItemizedDeductions): Action

// Student loan interest (1098-E)
function add1098e(form: F1098e): Action
function edit1098e(action: Edit1098eAction): Action
function remove1098e(index: number): Action

interface Edit1098eAction {
  index: number
  value: F1098e
}
```

**Usage Example:**
```typescript
import { setItemizedDeductions, add1098e } from 'src/redux/actions'

// Set itemized deductions
dispatch(setItemizedDeductions({
  homeMortgageInterest: 18000,
  stateAndLocalTaxes: 10000,
  charitableDonations: 4500
}))

// Add student loan interest
dispatch(add1098e({
  lender: 'Great Lakes',
  interest: 1800,
  personRole: PersonRole.PRIMARY
}))
```

#### Retirement Account Actions

```typescript
// Health Savings Account
function addHSA(hsa: HealthSavingsAccountDateString): Action
function editHSA(action: EditHSAAction): Action
function removeHSA(index: number): Action

interface EditHSAAction {
  index: number
  value: HealthSavingsAccountDateString
}

// IRA
function addIRA(ira: Ira): Action
function editIRA(action: EditIraAction): Action
function removeIRA(index: number): Action

interface EditIraAction {
  index: number
  value: Ira
}
```

**Usage Example:**
```typescript
import { addHSA, addIRA } from 'src/redux/actions'

// Add HSA
dispatch(addHSA({
  label: 'Family HSA 2024',
  coverageType: 'family',
  contributions: 8000,
  personRole: PersonRole.PRIMARY,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  totalDistributions: 2500,
  qualifiedDistributions: 2500
}))

// Add IRA contribution
dispatch(addIRA({
  payer: 'Vanguard',
  personRole: PersonRole.PRIMARY,
  grossDistribution: 0,
  taxableAmount: 0,
  taxableAmountNotDetermined: false,
  totalDistribution: false,
  federalIncomeTaxWithheld: 0,
  planType: IraPlanType.IRA,
  contributions: 7000,
  rolloverContributions: 0,
  rothIraConversion: 0,
  recharacterizedContributions: 0,
  requiredMinimumDistributions: 0,
  lateContributions: 0,
  repayments: 0
}))
```

#### Other Actions

```typescript
// Questions (yes/no responses)
function answerQuestion(question: string, answer: boolean): Action

// Refund information
function saveRefundInfo(refund: Refund): Action

// Tax year management
function setActiveYear(year: TaxYear): Action
function setInfo(year: TaxYear, info: InformationDateString): Action

enum TaxYear {
  Y2019 = 'Y2019',
  Y2020 = 'Y2020',
  Y2021 = 'Y2021',
  Y2022 = 'Y2022',
  Y2023 = 'Y2023',
  Y2024 = 'Y2024'
}
```

**Usage Example:**
```typescript
import { answerQuestion, saveRefundInfo, setActiveYear } from 'src/redux/actions'

// Answer questions
dispatch(answerQuestion('haveForeignBankAccount', false))
dispatch(answerQuestion('haveCryptocurrency', true))

// Save refund info
dispatch(saveRefundInfo({
  routingNumber: '123456789',
  accountNumber: '9876543210',
  accountType: AccountType.checking
}))

// Change active year
dispatch(setActiveYear('Y2024'))
```

---

## Validation Functions

All data MUST be validated before dispatching to Redux. UsTaxes uses AJV (Another JSON Schema Validator) for runtime type checking.

### Validation Pattern

```typescript
import * as validators from 'ustaxes/core/data/validate'

// Generic validation helper
function checkType<A>(data: A, validate: ValidateFunction<A>): A

// Usage
const validatedData = validators.checkType(data, validators.incomeW2)
```

### Available Validators

```typescript
import * as validators from 'ustaxes/core/data/validate'

// Person validators
validators.person(data: PersonDateString): boolean
validators.primaryPerson(data: PrimaryPersonDateString): boolean
validators.spouse(data: SpouseDateString): boolean
validators.dependent(data: DependentDateString): boolean

// Income validators
validators.incomeW2(data: IncomeW2): boolean
validators.supported1099(data: Supported1099): boolean
validators.income1099Int(data: Income1099Int): boolean
validators.income1099B(data: Income1099B): boolean

// Deduction validators
validators.itemizedDeductions(data: ItemizedDeductions): boolean
validators.f1098e(data: F1098e): boolean

// Retirement validators
validators.healthSavingsAccount(data: HealthSavingsAccountDateString): boolean
validators.ira(data: Ira): boolean

// Meta validators
validators.filingStatus(status: FilingStatus): boolean
validators.contactInfo(info: ContactInfo): boolean
validators.address(addr: Address): boolean
validators.refund(refund: Refund): boolean
validators.information(info: InformationDateString): boolean

// Primitive validators
validators.index(idx: number): boolean
validators.taxYear(year: TaxYear): boolean
```

### Validation Examples

```typescript
import * as validators from 'ustaxes/core/data/validate'
import { addW2, add1099 } from 'src/redux/actions'

// Example 1: Validate W-2 before dispatch
const w2Data: IncomeW2 = {
  occupation: 'Engineer',
  income: 100000,
  medicareIncome: 100000,
  fedWithholding: 18000,
  ssWages: 100000,
  ssWithholding: 6200,
  medicareWithholding: 1450,
  personRole: PersonRole.PRIMARY
}

if (validators.incomeW2(w2Data)) {
  dispatch(addW2(w2Data))
} else {
  console.error('Invalid W-2 data:', validators.incomeW2.errors)
}

// Example 2: Validate and throw on error
try {
  const validated = validators.checkType(w2Data, validators.incomeW2)
  dispatch(addW2(validated))
} catch (error) {
  console.error('Validation failed:', error.message)
}

// Example 3: Validate complete information
const info: InformationDateString = {
  taxPayer: {
    primaryPerson: { /* ... */ },
    dependents: [],
    filingStatus: FilingStatus.S
  },
  w2s: [w2Data],
  f1099s: [],
  // ... rest of fields
}

if (validators.information(info)) {
  console.log('Complete return is valid')
} else {
  console.error('Validation errors:', validators.information.errors)
}
```

### Validation Error Handling

```typescript
import { DefinedError } from 'ajv'

function validateWithDetails<T>(
  data: T,
  validator: ValidateFunction<T>
): { valid: boolean; errors?: string[] } {

  const valid = validator(data)

  if (!valid && validator.errors) {
    const errors = validator.errors.map((err: DefinedError) =>
      `${err.instancePath}: ${err.message ?? 'Unknown error'}`
    )
    return { valid: false, errors }
  }

  return { valid: true }
}

// Usage
const result = validateWithDetails(w2Data, validators.incomeW2)
if (!result.valid) {
  console.error('Validation failed:')
  result.errors?.forEach(err => console.error(`  - ${err}`))
}
```

---

## Tax Calculation Functions

### 2024 Tax Brackets

```typescript
interface TaxBracket {
  limit: number
  rate: number
}

// Single filer 2024 tax brackets
const singleBrackets2024: TaxBracket[] = [
  { limit: 11600, rate: 0.10 },    // 10% up to $11,600
  { limit: 47150, rate: 0.12 },    // 12% up to $47,150
  { limit: 100525, rate: 0.22 },   // 22% up to $100,525
  { limit: 191950, rate: 0.24 },   // 24% up to $191,950
  { limit: 243725, rate: 0.32 },   // 32% up to $243,725
  { limit: 609350, rate: 0.35 },   // 35% up to $609,350
  { limit: Infinity, rate: 0.37 }  // 37% above $609,350
]

// Married Filing Jointly 2024
const mfjBrackets2024: TaxBracket[] = [
  { limit: 23200, rate: 0.10 },
  { limit: 94300, rate: 0.12 },
  { limit: 201050, rate: 0.22 },
  { limit: 383900, rate: 0.24 },
  { limit: 487450, rate: 0.32 },
  { limit: 731200, rate: 0.35 },
  { limit: Infinity, rate: 0.37 }
]

// Head of Household 2024
const hohBrackets2024: TaxBracket[] = [
  { limit: 16550, rate: 0.10 },
  { limit: 63100, rate: 0.12 },
  { limit: 100500, rate: 0.22 },
  { limit: 191950, rate: 0.24 },
  { limit: 243700, rate: 0.32 },
  { limit: 609350, rate: 0.35 },
  { limit: Infinity, rate: 0.37 }
]
```

### Standard Deductions 2024

```typescript
const standardDeductions2024 = {
  [FilingStatus.S]: 14600,      // Single
  [FilingStatus.MFJ]: 29200,    // Married Filing Jointly
  [FilingStatus.MFS]: 14600,    // Married Filing Separately
  [FilingStatus.HOH]: 21900,    // Head of Household
  [FilingStatus.W]: 29200       // Widow(er)
}
```

### Progressive Tax Calculation

```typescript
function calculateTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): number {
  let tax = 0
  let previousLimit = 0

  for (const bracket of brackets) {
    if (taxableIncome <= previousLimit) break

    const incomeInBracket = Math.min(
      taxableIncome - previousLimit,
      bracket.limit - previousLimit
    )

    tax += incomeInBracket * bracket.rate
    previousLimit = bracket.limit

    if (taxableIncome <= bracket.limit) break
  }

  return Math.round(tax)
}
```

**Usage:**
```typescript
// Calculate tax for $75,000 taxable income (single)
const taxableIncome = 75000
const tax = calculateTax(taxableIncome, singleBrackets2024)
console.log(`Federal tax: $${tax.toLocaleString()}`)
// Output: Federal tax: $10,753

// Breakdown:
// $11,600 × 10% = $1,160
// $35,550 × 12% = $4,266  ($47,150 - $11,600)
// $27,450 × 22% = $6,039  ($75,000 - $47,150)
// Total: $11,465
```

### Self-Employment Tax

```typescript
const SE_TAX_RATE = 0.9235  // 92.35% of net profit subject to SE tax
const SS_RATE = 0.124       // 12.4% Social Security
const MEDICARE_RATE = 0.029 // 2.9% Medicare

function calculateSelfEmploymentTax(netProfit: number): {
  seTax: number
  deductibleHalf: number
} {
  const seIncome = netProfit * SE_TAX_RATE
  const ssTax = Math.min(seIncome, 168600) * SS_RATE  // 2024 SS wage base
  const medicareTax = seIncome * MEDICARE_RATE

  const seTax = ssTax + medicareTax
  const deductibleHalf = seTax / 2  // Deduct half on Form 1040

  return { seTax, deductibleHalf }
}
```

**Usage:**
```typescript
const scheduleC NetProfit = 80000
const { seTax, deductibleHalf } = calculateSelfEmploymentTax(netProfit)

console.log(`SE tax: $${seTax.toLocaleString()}`)
console.log(`Deductible: $${deductibleHalf.toLocaleString()}`)

// Output:
// SE tax: $11,304
// Deductible: $5,652
```

### Additional Taxes

#### Net Investment Income Tax (NIIT)

```typescript
const NIIT_RATE = 0.038
const NIIT_THRESHOLDS = {
  [FilingStatus.S]: 200000,
  [FilingStatus.MFJ]: 250000,
  [FilingStatus.MFS]: 125000,
  [FilingStatus.HOH]: 200000,
  [FilingStatus.W]: 250000
}

function calculateNIIT(
  magi: number,
  netInvestmentIncome: number,
  filingStatus: FilingStatus
): number {
  const threshold = NIIT_THRESHOLDS[filingStatus]

  if (magi <= threshold) return 0

  const excessMAGI = magi - threshold
  const taxableAmount = Math.min(excessMAGI, netInvestmentIncome)

  return Math.round(taxableAmount * NIIT_RATE)
}
```

**Usage:**
```typescript
const magi = 280000
const netInvestmentIncome = 50000
const niit = calculateNIIT(magi, netInvestmentIncome, FilingStatus.S)
console.log(`NIIT: $${niit.toLocaleString()}`)
// Output: NIIT: $1,900
// ($280k - $200k = $80k excess, min with $50k NII = $50k × 3.8% = $1,900)
```

#### Additional Medicare Tax

```typescript
const ADDITIONAL_MEDICARE_RATE = 0.009
const ADDITIONAL_MEDICARE_THRESHOLDS = {
  [FilingStatus.S]: 200000,
  [FilingStatus.MFJ]: 250000,
  [FilingStatus.MFS]: 125000,
  [FilingStatus.HOH]: 200000,
  [FilingStatus.W]: 250000
}

function calculateAdditionalMedicare(
  wages: number,
  filingStatus: FilingStatus
): number {
  const threshold = ADDITIONAL_MEDICARE_THRESHOLDS[filingStatus]

  if (wages <= threshold) return 0

  return Math.round((wages - threshold) * ADDITIONAL_MEDICARE_RATE)
}
```

---

## Form Generation API

### Creating Forms

```typescript
import { create1040 } from 'src/forms/Y2024/irsForms/Main'
import { create1040PDFs } from 'src/forms/Y2024/irsForms/index'
import { Either } from 'fp-ts/Either'

// Create form objects
function create1040(
  info: Information,
  assets: Asset[]
): Either<string[], [Information, Form[]]>

// Generate PDF bytes
async function create1040PDFs(
  state: YearsTaxesState,
  assets: Asset[]
): Promise<Uint8Array>
```

**Usage:**
```typescript
import { create1040, create1040PDFs } from 'src/forms/Y2024/irsForms'
import { isRight } from 'fp-ts/Either'
import * as fs from 'fs'

// Get state from Redux
const state = store.getState()
const assets = state.assets

// Generate forms
const result = create1040(state.Y2024, assets)

if (isRight(result)) {
  const [validatedInfo, forms] = result.right

  console.log(`Generated ${forms.length} forms:`)
  forms.forEach(form => console.log(`  - ${form.formName}`))

  // Generate PDF
  const pdfBytes = await create1040PDFs(state, assets)

  // Save PDF
  fs.writeFileSync('tax-return-2024.pdf', pdfBytes)
  console.log('PDF saved successfully')

} else {
  const errors = result.left
  console.error('Form generation failed:')
  errors.forEach(err => console.error(`  - ${err}`))
}
```

### Form Base Class

```typescript
abstract class Form {
  abstract tag: string
  abstract sequenceIndex: number

  abstract isNeeded(): boolean
  abstract fields(): Field[]

  readonly formName: string
  readonly formOrder: number
}

type Field = string | number | boolean | undefined
```

### Available Forms (2024)

```typescript
// Main forms
Form1040      // U.S. Individual Income Tax Return
Form1040V     // Payment Voucher

// Schedules
ScheduleA     // Itemized Deductions
ScheduleB     // Interest and Ordinary Dividends
ScheduleC     // Profit or Loss from Business
ScheduleD     // Capital Gains and Losses
ScheduleE     // Supplemental Income and Loss
ScheduleSE    // Self-Employment Tax
ScheduleEIC   // Earned Income Credit
Schedule1     // Additional Income and Adjustments
Schedule2     // Additional Taxes
Schedule3     // Additional Credits and Payments
Schedule8812  // Child Tax Credit

// Additional forms
Form8949      // Sales and Dispositions of Capital Assets
Form8889      // Health Savings Accounts
Form8959      // Additional Medicare Tax
Form8960      // Net Investment Income Tax
Form6251      // Alternative Minimum Tax
Form8995      // Qualified Business Income Deduction
// ... and 23 more forms
```

---

## MCP Server Tools

The automation layer includes three MCP (Model Context Protocol) servers providing specialized functionality.

### tax-document-parser

OCR and document extraction server.

```typescript
// Tool: parse_tax_document
interface ParseTaxDocumentInput {
  file_path: string
  document_type?: 'W2' | '1099-INT' | '1099-DIV' | '1099-B' | '1098' | 'auto'
}

interface ParseTaxDocumentOutput {
  type: string
  confidence: number
  data: IncomeW2 | Supported1099 | F1098e
  raw_text: string
  warnings: string[]
}
```

**Usage:**
```typescript
// Via Claude Code
You: Extract data from ~/taxes/w2-2024.pdf

Claude: [Invokes tax-document-parser MCP]

        Document Type: W-2 (confidence: 0.96)
        Employer: Acme Corp (EIN: 12-3456789)
        Wages: $85,000.00
        Federal withholding: $12,750.00

        Does this look correct?
```

### irs-rules-engine

IRS rule lookup and compliance checking.

```typescript
// Tool: lookup_rule
interface LookupRuleInput {
  topic: string
  tax_year: number
}

interface LookupRuleOutput {
  rule: string
  source: string  // IRS publication reference
  details: string
}

// Tool: check_eligibility
interface CheckEligibilityInput {
  credit_or_deduction: string
  income: number
  filing_status: FilingStatus
  dependents: number
}

interface CheckEligibilityOutput {
  eligible: boolean
  amount?: number
  phaseout_info?: string
  requirements: string[]
}
```

**Usage:**
```typescript
// Via Claude Code
You: Am I eligible for the child tax credit?
     Income: $75,000
     Filing status: Single
     2 kids under 17

Claude: [Invokes irs-rules-engine]

        ✅ Eligible for Child Tax Credit

        Amount: $4,000 ($2,000 per child)
        Requirements met:
        - Children under 17 ✓
        - Income below phaseout ($200,000 single) ✓
        - US citizens ✓
```

### form-validator

Comprehensive validation and audit checking.

```typescript
// Tool: validate_return
interface ValidateReturnInput {
  information: Information
  tax_year: number
}

interface ValidateReturnOutput {
  valid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
  audit_score: number  // 0-100, higher = lower audit risk
}

interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning' | 'info'
}
```

**Usage:**
```typescript
// Via Claude Code
You: /validate-return 2024

Claude: [Invokes form-validator]

        ✓ All required fields complete
        ✓ Math verified across all forms
        ✓ SSN/EIN formats valid
        ✓ Income matches W-2s
        ✓ Schedules properly attached

        ⚠ 2 warnings:
        - High charitable deduction (15% of AGI)
        - No state tax withholding reported

        Audit risk score: 12/100 (Low)
```

---

## Utilities and Helpers

### Date Conversion

```typescript
// Convert Date objects to ISO strings for Redux
function dateToStringPerson<P extends Person<Date>>(
  p: P
): Omit<P, 'dateOfBirth'> & { dateOfBirth: string }

// Convert ISO strings to Date objects
function stringToDatePerson<P extends Person<string>>(
  p: P
): Omit<P, 'dateOfBirth'> & { dateOfBirth: Date }

// Convert full Information object
function infoToStringInfo(info: Information<Date>): Information<string>
function stringToDateInfo(info: Information<string>): Information<Date>
```

**Usage:**
```typescript
const person: Person<Date> = {
  firstName: 'John',
  lastName: 'Doe',
  ssid: '123-45-6789',
  role: PersonRole.PRIMARY,
  isBlind: false,
  dateOfBirth: new Date('1985-06-15')
}

// For Redux dispatch (needs strings)
const personString = dateToStringPerson(person)
dispatch(savePrimaryPersonInfo(personString))

// For calculations (needs Dates)
const personDate = stringToDatePerson(personString)
const age = calculateAge(personDate.dateOfBirth)
```

### State Enumeration

```typescript
enum State {
  AL = 'AL', AK = 'AK', AZ = 'AZ', AR = 'AR', CA = 'CA',
  CO = 'CO', CT = 'CT', DE = 'DE', FL = 'FL', GA = 'GA',
  HI = 'HI', ID = 'ID', IL = 'IL', IN = 'IN', IA = 'IA',
  KS = 'KS', KY = 'KY', LA = 'LA', ME = 'ME', MD = 'MD',
  MA = 'MA', MI = 'MI', MN = 'MN', MS = 'MS', MO = 'MO',
  MT = 'MT', NE = 'NE', NV = 'NV', NH = 'NH', NJ = 'NJ',
  NM = 'NM', NY = 'NY', NC = 'NC', ND = 'ND', OH = 'OH',
  OK = 'OK', OR = 'OR', PA = 'PA', RI = 'RI', SC = 'SC',
  SD = 'SD', TN = 'TN', TX = 'TX', UT = 'UT', VT = 'VT',
  VA = 'VA', WA = 'WA', WV = 'WV', WI = 'WI', WY = 'WY',
  DC = 'DC'
}
```

### Response Questions

Common yes/no questions asked during tax preparation:

```typescript
interface Responses {
  [key: string]: boolean
}

// Common questions:
const questions = {
  'haveForeignBankAccount': boolean,      // FBAR reporting
  'haveCryptocurrency': boolean,          // Virtual currency
  'claimDependentCare': boolean,          // Form 2441
  'claimEducationCredit': boolean,        // Form 8863
  'itemizeDeductions': boolean,           // Schedule A
  'haveHealthInsurance': boolean,         // Individual mandate
  'receiveAdvancedPremiumTaxCredit': boolean,  // Form 8962
  'makeEstimatedTaxPayments': boolean     // Form 1040-ES
}
```

**Usage:**
```typescript
import { answerQuestion } from 'src/redux/actions'

dispatch(answerQuestion('haveForeignBankAccount', false))
dispatch(answerQuestion('haveCryptocurrency', true))
dispatch(answerQuestion('itemizeDeductions', true))
```

---

## Complete Examples

### Example 1: Simple W-2 Return

```typescript
import {
  savePrimaryPersonInfo,
  saveFilingStatusInfo,
  addW2,
  saveRefundInfo,
  setActiveYear
} from 'src/redux/actions'
import * as validators from 'ustaxes/core/data/validate'
import { create1040PDFs } from 'src/forms/Y2024/irsForms'

// Set tax year
dispatch(setActiveYear('Y2024'))

// Add taxpayer
const taxpayer: PrimaryPersonDateString = {
  firstName: 'Alice',
  lastName: 'Johnson',
  ssid: '123-45-6789',
  role: PersonRole.PRIMARY,
  isBlind: false,
  dateOfBirth: '1990-03-15',
  address: {
    address: '123 Main St',
    city: 'Portland',
    state: 'OR',
    zip: '97201'
  },
  isTaxpayerDependent: false
}

validators.checkType(taxpayer, validators.primaryPerson)
dispatch(savePrimaryPersonInfo(taxpayer))

// Set filing status
dispatch(saveFilingStatusInfo(FilingStatus.S))

// Add W-2
const w2: IncomeW2 = {
  occupation: 'Software Engineer',
  income: 95000,
  medicareIncome: 95000,
  fedWithholding: 14250,
  ssWages: 95000,
  ssWithholding: 5890,
  medicareWithholding: 1377.50,
  employer: {
    EIN: '12-3456789',
    employerName: 'Tech Corp'
  },
  personRole: PersonRole.PRIMARY
}

validators.checkType(w2, validators.incomeW2)
dispatch(addW2(w2))

// Add refund info
const refund: Refund = {
  routingNumber: '123456789',
  accountNumber: '9876543210',
  accountType: AccountType.checking
}

validators.checkType(refund, validators.refund)
dispatch(saveRefundInfo(refund))

// Generate forms
const state = store.getState()
const pdfBytes = await create1040PDFs(state, [])

// Tax calculation (approximate):
// Income: $95,000
// Standard deduction: -$14,600
// Taxable income: $80,400
// Tax: ~$12,500
// Withholding: -$14,250
// Refund: ~$1,750
```

### Example 2: Self-Employed with Deductions

```typescript
import {
  savePrimaryPersonInfo,
  saveFilingStatusInfo,
  setItemizedDeductions,
  add1098e,
  addHSA,
  answerQuestion
} from 'src/redux/actions'

// Set up taxpayer (same as Example 1)
// ...

// Schedule C income (handled separately, not in this example)
const scheduleC = {
  businessIncome: 120000,
  businessExpenses: 25000,
  netProfit: 95000
}

// Itemized deductions
const itemized: ItemizedDeductions = {
  homeMortgageInterest: 18000,
  stateAndLocalTaxes: 10000,    // SALT cap
  charitableDonations: 6000
}

validators.checkType(itemized, validators.itemizedDeductions)
dispatch(setItemizedDeductions(itemized))
// Total itemized: $34,000 (vs $14,600 standard)

// Student loan interest
const studentLoan: F1098e = {
  lender: 'Sallie Mae',
  interest: 2500,              // Max deduction
  personRole: PersonRole.PRIMARY
}

validators.checkType(studentLoan, validators.f1098e)
dispatch(add1098e(studentLoan))

// HSA contribution
const hsa: HealthSavingsAccountDateString = {
  label: 'HSA 2024',
  coverageType: 'self-only',
  contributions: 4150,         // 2024 limit
  personRole: PersonRole.PRIMARY,
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  totalDistributions: 1500,
  qualifiedDistributions: 1500
}

validators.checkType(hsa, validators.healthSavingsAccount)
dispatch(addHSA(hsa))

// Answer questions
dispatch(answerQuestion('itemizeDeductions', true))
dispatch(answerQuestion('haveCryptocurrency', false))

// Tax calculation:
// Schedule C net profit: $95,000
// SE tax: ~$13,419
// Deductible SE tax: -$6,710
//
// AGI adjustments:
// - Student loan interest: -$2,500
// - HSA contribution: -$4,150
// - SE tax deduction: -$6,710
// AGI: $81,640
//
// AGI: $81,640
// Itemized deductions: -$34,000
// QBI deduction (20%): -$16,328
// Taxable income: $31,312
// Regular tax: ~$3,504
// SE tax: +$13,419
// Total tax: ~$16,923
```

### Example 3: Married with Investment Income

```typescript
import {
  savePrimaryPersonInfo,
  addSpouse,
  addDependent,
  saveFilingStatusInfo,
  addW2,
  add1099
} from 'src/redux/actions'

// Primary taxpayer
const primary: PrimaryPersonDateString = {
  firstName: 'Bob',
  lastName: 'Smith',
  ssid: '111-22-3333',
  role: PersonRole.PRIMARY,
  isBlind: false,
  dateOfBirth: '1982-07-20',
  address: {
    address: '456 Oak Ave',
    city: 'Austin',
    state: 'TX',
    zip: '78701'
  },
  isTaxpayerDependent: false
}
dispatch(savePrimaryPersonInfo(primary))

// Spouse
const spouse: SpouseDateString = {
  firstName: 'Carol',
  lastName: 'Smith',
  ssid: '222-33-4444',
  role: PersonRole.SPOUSE,
  isBlind: false,
  dateOfBirth: '1984-11-10',
  isTaxpayerDependent: false
}
dispatch(addSpouse(spouse))

// Dependents
const kid1: DependentDateString = {
  firstName: 'Danny',
  lastName: 'Smith',
  ssid: '333-44-5555',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: '2015-04-05',
  relationship: 'Son',
  qualifyingInfo: {
    numberOfMonths: 12,
    isStudent: false
  }
}
dispatch(addDependent(kid1))

const kid2: DependentDateString = {
  firstName: 'Emma',
  lastName: 'Smith',
  ssid: '444-55-6666',
  role: PersonRole.DEPENDENT,
  isBlind: false,
  dateOfBirth: '2018-09-12',
  relationship: 'Daughter',
  qualifyingInfo: {
    numberOfMonths: 12,
    isStudent: false
  }
}
dispatch(addDependent(kid2))

// Filing status
dispatch(saveFilingStatusInfo(FilingStatus.MFJ))

// W-2 for primary
const bobW2: IncomeW2 = {
  occupation: 'Manager',
  income: 110000,
  medicareIncome: 110000,
  fedWithholding: 16500,
  ssWages: 110000,
  ssWithholding: 6820,
  medicareWithholding: 1595,
  employer: { EIN: '11-1111111', employerName: 'Corp A' },
  personRole: PersonRole.PRIMARY
}
dispatch(addW2(bobW2))

// W-2 for spouse
const carolW2: IncomeW2 = {
  occupation: 'Teacher',
  income: 58000,
  medicareIncome: 58000,
  fedWithholding: 6960,
  ssWages: 58000,
  ssWithholding: 3596,
  medicareWithholding: 841,
  employer: { EIN: '22-2222222', employerName: 'School District' },
  personRole: PersonRole.SPOUSE
}
dispatch(addW2(carolW2))

// Investment income (1099-DIV)
const dividends: Income1099Div = {
  payer: 'Vanguard',
  type: Income1099Type.DIV,
  form: {
    dividends: 8000,
    qualifiedDividends: 7500,
    totalCapitalGainsDistributions: 2000
  },
  personRole: PersonRole.PRIMARY
}
dispatch(add1099(dividends))

// Interest income (1099-INT)
const interest: Income1099Int = {
  payer: 'Bank of America',
  type: Income1099Type.INT,
  form: { income: 650 },
  personRole: PersonRole.PRIMARY
}
dispatch(add1099(interest))

// Tax calculation:
// W-2 income: $168,000
// Dividends: $8,000
// Interest: $650
// Total income: $176,650
//
// Standard deduction (MFJ): -$29,200
// Taxable income: $147,450
//
// Tax on ordinary income: ~$22,580
// Tax on qualified dividends (15%): $1,125
// Total regular tax: ~$23,705
//
// Child Tax Credit: -$4,000 (2 × $2,000)
// Total withholding: -$23,460
//
// Tax owed: ~$245
```

---

## Error Handling Best Practices

### Validation Errors

```typescript
import * as validators from 'ustaxes/core/data/validate'

function safeDispatch<T>(
  data: T,
  validator: ValidateFunction<T>,
  action: (data: T) => Action
): boolean {
  try {
    const validated = validators.checkType(data, validator)
    dispatch(action(validated))
    return true
  } catch (error) {
    if (error instanceof Error) {
      console.error('Validation failed:', error.message)

      // Log to user (via Claude response)
      console.log(`Error: ${error.message}`)
      console.log('Please check the data and try again.')
    }
    return false
  }
}

// Usage
const success = safeDispatch(w2Data, validators.incomeW2, addW2)
if (!success) {
  // Handle error (ask user for corrections)
}
```

### Form Generation Errors

```typescript
import { create1040 } from 'src/forms/Y2024/irsForms/Main'
import { isLeft, isRight } from 'fp-ts/Either'

const result = create1040(state.Y2024, assets)

if (isLeft(result)) {
  const errors = result.left
  console.error('Form generation failed:')
  errors.forEach((err, index) => {
    console.error(`${index + 1}. ${err}`)
  })

  // Common errors:
  // - Missing required fields (name, SSN, filing status)
  // - Invalid SSN format
  // - Math inconsistencies
  // - Missing schedules when needed

  // Suggest fixes to user
  console.log('\nPlease verify:')
  console.log('- All personal information is complete')
  console.log('- SSNs are in XXX-XX-XXXX format')
  console.log('- All required questions are answered')

} else {
  const [info, forms] = result.right
  console.log(`✓ Successfully generated ${forms.length} forms`)
}
```

---

## Testing Your Integration

### Unit Testing with Mock Data

```typescript
import { createStore } from 'redux'
import { rootReducer } from 'src/redux/reducer'
import * as validators from 'ustaxes/core/data/validate'

describe('Tax Return Automation', () => {
  let store: Store

  beforeEach(() => {
    store = createStore(rootReducer)
    store.dispatch(setActiveYear('Y2024'))
  })

  test('should add valid W-2', () => {
    const w2: IncomeW2 = {
      occupation: 'Engineer',
      income: 100000,
      medicareIncome: 100000,
      fedWithholding: 15000,
      ssWages: 100000,
      ssWithholding: 6200,
      medicareWithholding: 1450,
      personRole: PersonRole.PRIMARY
    }

    expect(validators.incomeW2(w2)).toBe(true)
    store.dispatch(addW2(w2))

    const state = store.getState()
    expect(state.Y2024.w2s).toHaveLength(1)
    expect(state.Y2024.w2s[0].income).toBe(100000)
  })

  test('should reject invalid SSN format', () => {
    const invalidPerson = {
      firstName: 'John',
      lastName: 'Doe',
      ssid: '123456789',  // Missing dashes
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: '1985-06-15',
      address: { /* ... */ },
      isTaxpayerDependent: false
    }

    expect(validators.primaryPerson(invalidPerson)).toBe(false)
  })

  test('should calculate correct tax', () => {
    // Set up complete return
    // ... dispatch all required actions

    const state = store.getState()
    const result = create1040(state.Y2024, [])

    expect(isRight(result)).toBe(true)

    if (isRight(result)) {
      const [info, forms] = result.right
      const form1040 = forms.find(f => f.tag === 'f1040')

      // Verify calculations
      expect(form1040).toBeDefined()
      // ... additional assertions
    }
  })
})
```

---

## Performance Considerations

### Batch Dispatches

```typescript
// ❌ BAD: Multiple separate dispatches
w2s.forEach(w2 => dispatch(addW2(w2)))

// ✅ GOOD: Batch with redux-batch-enhancer or similar
dispatch(batchActions(
  w2s.map(w2 => addW2(w2))
))
```

### Validation Caching

```typescript
// Cache validator results for repeated checks
const validatedCache = new WeakMap()

function cachedValidate<T>(
  data: T,
  validator: ValidateFunction<T>
): boolean {
  if (validatedCache.has(data)) {
    return validatedCache.get(data)
  }

  const result = validator(data)
  validatedCache.set(data, result)
  return result
}
```

### Lazy Form Generation

```typescript
// Don't generate all forms upfront
// Only generate when needed (user requests PDF)

function generateFormsOnDemand(state: YearsTaxesState): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const pdfBytes = await create1040PDFs(state, state.assets)
        resolve(pdfBytes)
      } catch (error) {
        reject(error)
      }
    }, 0)  // Allow UI to update
  })
}
```

---

## Security Best Practices

### SSN Handling

```typescript
// ❌ NEVER log SSNs in plain text
console.log('Adding taxpayer:', taxpayer)  // Exposes SSN

// ✅ ALWAYS redact sensitive data in logs
function redactSSN(person: Person): Person {
  return {
    ...person,
    ssid: person.ssid.replace(/\d(?=\d{4})/g, '*')  // ***-**-1234
  }
}

console.log('Adding taxpayer:', redactSSN(taxpayer))
```

### Data Encryption

```typescript
// Encrypt before saving to localStorage
import { encrypt, decrypt } from 'your-crypto-library'

function saveToStorage(key: string, data: any): void {
  const encrypted = encrypt(JSON.stringify(data), getUserKey())
  localStorage.setItem(key, encrypted)
}

function loadFromStorage(key: string): any {
  const encrypted = localStorage.getItem(key)
  if (!encrypted) return null

  const decrypted = decrypt(encrypted, getUserKey())
  return JSON.parse(decrypted)
}
```

### Input Sanitization

```typescript
// Sanitize user inputs
function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/[<>]/g, '')
}

// Validate numeric inputs
function sanitizeNumber(input: any): number {
  const num = Number(input)
  if (!Number.isFinite(num)) {
    throw new Error('Invalid number')
  }
  return num
}
```

---

## Changelog

### v1.0.0 (2025-11-27)

**Initial Release**
- Complete TypeScript type definitions
- Redux actions API
- Validation functions
- Tax calculation helpers
- Form generation API
- MCP server documentation
- 119 code examples
- 3 complete workflow examples

---

## Support

### Documentation
- **Quick Start:** `.claude/docs/QUICK_START.md`
- **User Guide:** `.claude/docs/AI_AUTOMATION_GUIDE.md`
- **Architecture:** `.claude/docs/ARCHITECTURE.md`
- **Self-Employed:** `.claude/docs/SELF_EMPLOYED_GUIDE.md`

### Issues
- GitHub: https://github.com/ustaxes/ustaxes/issues
- Label: `automation-layer`

### Contributing
- Submit TypeScript type improvements
- Add new examples
- Report API issues
- Suggest enhancements

---

## License

**Automation Layer:** MIT License
**UsTaxes Core:** GPL-3.0 License

---

**Last Updated:** 2025-11-27
**Version:** 1.0.0
**Maintainer:** Claude Code Automation Team
