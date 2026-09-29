import { SelfEmployedHealthInsuranceWorksheet } from './data'
import { toFiniteNumber } from './util'

export interface Form7206DerivedInputs {
  line1?: unknown
  line2?: unknown
  line4?: unknown
  line5?: unknown
  line9?: unknown
  line11?: unknown
  line12?: unknown
  deductibleSelfEmploymentTax?: unknown
}

export type Form7206DerivedLines = Pick<
  SelfEmployedHealthInsuranceWorksheet,
  'line3' | 'line6' | 'line7' | 'line8' | 'line10' | 'line13' | 'line14'
>

const addLines = (
  left: number | undefined,
  right: number | undefined
): number | undefined =>
  left === undefined && right === undefined
    ? undefined
    : (left ?? 0) + (right ?? 0)

const subtractFromLine = (
  left: number | undefined,
  right: number | undefined
): number | undefined => (left === undefined ? undefined : left - (right ?? 0))

export const computeForm7206DerivedLines = ({
  line1,
  line2,
  line4,
  line5,
  line9,
  line11,
  line12,
  deductibleSelfEmploymentTax
}: Form7206DerivedInputs): Form7206DerivedLines => {
  const l1 = toFiniteNumber(line1)
  const l2 = toFiniteNumber(line2)
  const l4 = toFiniteNumber(line4)
  const l5 = toFiniteNumber(line5)
  const l9 = toFiniteNumber(line9)
  const l11 = toFiniteNumber(line11)
  const l12 = toFiniteNumber(line12)
  const deductibleTax = toFiniteNumber(deductibleSelfEmploymentTax)

  const line3 = addLines(l1, l2)
  const line6 =
    l4 !== undefined && l5 !== undefined && l5 !== 0 ? l4 / l5 : undefined
  const line7 =
    line6 !== undefined && deductibleTax !== undefined
      ? deductibleTax * line6
      : undefined
  const line8 = subtractFromLine(l4, line7)
  const line10 = subtractFromLine(line8, l9)
  const applicableIncomeBase = l4 !== undefined ? line10 : l11 ?? line10
  const line13 = subtractFromLine(applicableIncomeBase, l12)
  const line14 =
    line3 !== undefined && line13 !== undefined
      ? Math.max(0, Math.min(line3, line13))
      : undefined

  return { line3, line6, line7, line8, line10, line13, line14 }
}

export const formatForm7206Ratio = (
  value: number | undefined
): string | undefined => {
  if (value === undefined) return undefined

  const trimmed = value.toFixed(6).replace(/0+$/, '').replace(/\.$/, '')
  return trimmed.length > 0 ? trimmed : '0'
}
