import { FilingStatus } from 'ustaxes/core/data'

/**
 * 2025 California tax parameters.
 *
 * Sources (all FTB, 2025 tax year):
 * - Tax rate schedules: https://www.ftb.ca.gov/forms/2025/2025-540-tax-rate-schedules.pdf
 * - Form 540 booklet / instructions: https://www.ftb.ca.gov/forms/2025/2025-540-booklet.html
 * - FTB 3853 instructions: https://www.ftb.ca.gov/forms/2025/2025-3853-instructions.pdf
 * - FTB 3506 instructions: https://www.ftb.ca.gov/forms/2025/2025-3506-instructions.html
 */

interface Bracket {
  /** Taxable income over this amount ... */
  over: number
  /** Base tax at the bottom of this bracket */
  base: number
  /** Marginal rate applied to the excess over `over` */
  rate: number
}

/** 2025 CA Tax Rate Schedule X (Single, MFS) */
const scheduleX: Bracket[] = [
  { over: 0, base: 0, rate: 0.01 },
  { over: 11079, base: 110.79, rate: 0.02 },
  { over: 26264, base: 414.49, rate: 0.04 },
  { over: 41452, base: 1022.01, rate: 0.06 },
  { over: 57542, base: 1987.41, rate: 0.08 },
  { over: 72724, base: 3201.97, rate: 0.093 },
  { over: 371479, base: 30986.19, rate: 0.103 },
  { over: 445771, base: 38638.27, rate: 0.113 },
  { over: 742953, base: 72219.84, rate: 0.123 }
]

/** 2025 CA Tax Rate Schedule Y (MFJ, Qualifying Surviving Spouse) */
const scheduleY: Bracket[] = [
  { over: 0, base: 0, rate: 0.01 },
  { over: 22158, base: 221.58, rate: 0.02 },
  { over: 52528, base: 828.98, rate: 0.04 },
  { over: 82904, base: 2044.02, rate: 0.06 },
  { over: 115084, base: 3974.82, rate: 0.08 },
  { over: 145448, base: 6403.94, rate: 0.093 },
  { over: 742958, base: 61972.37, rate: 0.103 },
  { over: 891542, base: 77276.52, rate: 0.113 },
  { over: 1485906, base: 144439.65, rate: 0.123 }
]

/** 2025 CA Tax Rate Schedule Z (Head of Household) */
const scheduleZ: Bracket[] = [
  { over: 0, base: 0, rate: 0.01 },
  { over: 22173, base: 221.73, rate: 0.02 },
  { over: 52530, base: 828.87, rate: 0.04 },
  { over: 67716, base: 1436.31, rate: 0.06 },
  { over: 83805, base: 2401.65, rate: 0.08 },
  { over: 98990, base: 3616.45, rate: 0.093 },
  { over: 505208, base: 41394.72, rate: 0.103 },
  { over: 606251, base: 51802.15, rate: 0.113 },
  { over: 1010417, base: 97472.91, rate: 0.123 }
]

const schedules: { [K in FilingStatus]: Bracket[] } = {
  [FilingStatus.S]: scheduleX,
  [FilingStatus.MFS]: scheduleX,
  [FilingStatus.MFJ]: scheduleY,
  [FilingStatus.W]: scheduleY,
  [FilingStatus.HOH]: scheduleZ
}

/** Exact tax from the rate schedule, unrounded */
export const scheduleTax = (status: FilingStatus, taxable: number): number => {
  const brackets = schedules[status]
  const b = [...brackets].reverse().find((br) => taxable > br.over)
  if (b === undefined) return 0
  return b.base + (taxable - b.over) * b.rate
}

/**
 * Form 540 line 19 taxable income of $100,000 or less must use the tax
 * table; above that, the rate schedules.
 */
export const taxTableLimit = 100000

/**
 * Reproduces the FTB tax table exactly: the table applies the rate
 * schedule to the midpoint of each income range and rounds. Ranges are
 * $1–$50, then $100-wide ranges ($51–$150, $151–$250, ...).
 */
export const taxTableTax = (status: FilingStatus, taxable: number): number => {
  if (taxable <= 0) return 0
  let mid: number
  if (taxable <= 50) {
    mid = 25.5
  } else {
    const lower = Math.floor((taxable - 51) / 100) * 100 + 51
    mid = lower + 49.5
  }
  return Math.round(scheduleTax(status, mid))
}

/** Form 540, line 31 tax: table at or under the limit, schedule above */
export const computeTax = (status: FilingStatus, taxable: number): number => {
  if (taxable <= taxTableLimit) return taxTableTax(status, taxable)
  return Math.round(scheduleTax(status, taxable))
}

export const standardDeduction = (status: FilingStatus): number => {
  switch (status) {
    case FilingStatus.S:
    case FilingStatus.MFS:
      return 5706
    default:
      // MFJ, HOH, Qualifying Surviving Spouse
      return 11412
  }
}

/** Form 540 lines 7-9: personal, blind, senior exemption credit, each */
export const personalExemption = 153
/** Form 540 line 10: dependent exemption credit, each */
export const dependentExemption = 475

/**
 * Federal AGI threshold above which exemption credits phase out and
 * itemized deductions are limited (Form 540 line 32 / Schedule CA line 29).
 */
export const highIncomeThreshold = (status: FilingStatus): number => {
  switch (status) {
    case FilingStatus.S:
    case FilingStatus.MFS:
      return 252203
    case FilingStatus.HOH:
      return 378310
    default:
      // MFJ, Qualifying Surviving Spouse
      return 504411
  }
}

/**
 * AGI Limitation Worksheet: each exemption credit is reduced by $6 for
 * each $2,500 ($1,250 MFS) or fraction thereof of federal AGI over the
 * threshold.
 */
export const exemptionReductionPerCredit = (
  status: FilingStatus,
  fedAGI: number
): number => {
  const excess = fedAGI - highIncomeThreshold(status)
  if (excess <= 0) return 0
  const divisor = status === FilingStatus.MFS ? 1250 : 2500
  return Math.ceil(excess / divisor) * 6
}

/** Behavioral Health Services Tax: 1% of taxable income over $1,000,000 */
export const behavioralHealthTaxThreshold = 1000000
export const behavioralHealthTaxRate = 0.01

/** Nonrefundable Renter's Credit (Form 540 line 46) */
export const rentersCredit = {
  caAGILimit: (status: FilingStatus): number =>
    status === FilingStatus.S || status === FilingStatus.MFS ? 53994 : 107988,
  amount: (status: FilingStatus): number =>
    status === FilingStatus.S || status === FilingStatus.MFS ? 60 : 120
}

/**
 * FTB 3506 (Child and Dependent Care Expenses Credit): CA credit is a
 * percentage of the federal Form 2441 credit, based on federal AGI.
 */
export const dependentCareCreditDecimal = (fedAGI: number): number => {
  if (fedAGI <= 40000) return 0.5
  if (fedAGI <= 70000) return 0.43
  if (fedAGI <= 100000) return 0.34
  return 0
}

/**
 * FTB 3853 Individual Shared Responsibility Penalty (2025).
 */
export const isrPenalty = {
  /** Flat monthly dollar amount per uncovered person 18 or older */
  flatPerAdult: 950,
  /** Flat monthly dollar amount per uncovered person under 18 */
  flatPerChild: 475,
  /** Maximum flat dollar amount per household per month */
  flatMonthlyMax: 2850,
  /** Percentage of applicable household income over the filing threshold */
  incomeRate: 0.025,
  /** 2025 state average bronze plan premium, per person per month */
  bronzePremiumMonthly: 377,
  /** Bronze premium annual cap uses at most 5 household members */
  bronzeMaxPeople: 5
}

/**
 * "Do I Have to File?" chart (FTB 3853 instructions, 2025): California
 * AGI filing thresholds by filing status, 65+ count, and number of
 * dependents (0, 1, 2+). Used for the ISR percentage-income method.
 * MFS uses the combined (MFJ) chart per FTB instructions.
 */
const agiThresholds: {
  [key: string]: [number, number, number]
} = {
  'single-0': [18353, 34186, 46061],
  'single-1': [26003, 37878, 47378],
  'joint-0': [36711, 52544, 64419],
  'joint-1': [44361, 56236, 65736],
  'joint-2': [52011, 63886, 73386]
}

export const filingThresholdAGI = (
  status: FilingStatus,
  age65OrOlderCount: number,
  dependentCount: number
): number => {
  const deps = Math.min(dependentCount, 2)
  const joint = status === FilingStatus.MFJ || status === FilingStatus.MFS
  const key = joint
    ? `joint-${Math.min(age65OrOlderCount, 2)}`
    : `single-${Math.min(age65OrOlderCount, 1)}`
  return agiThresholds[key][deps]
}

export default {
  scheduleTax,
  taxTableTax,
  computeTax,
  taxTableLimit,
  standardDeduction,
  personalExemption,
  dependentExemption,
  highIncomeThreshold,
  exemptionReductionPerCredit,
  behavioralHealthTaxThreshold,
  behavioralHealthTaxRate,
  rentersCredit,
  dependentCareCreditDecimal,
  isrPenalty,
  filingThresholdAGI
}
