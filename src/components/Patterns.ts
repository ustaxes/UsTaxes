import { TaxYear, TaxYears } from 'ustaxes/data'
import { daysInYear } from 'ustaxes/core/util'

export interface BasePattern {
  regexp?: RegExp
  description?: string
  format?: string
}

export interface NumericPattern extends BasePattern {
  readonly inputType: 'numeric'
  thousandSeparator?: boolean
  mask?: string
  prefix?: string
  allowEmptyFormatting?: boolean
  decimalScale?: number
  min?: number
  max?: number
}

export interface TextPattern extends BasePattern {
  readonly inputType: 'text'
}

export type PatternConfig = NumericPattern | TextPattern

// Convenience record syntax constructor for numeric patterns
const numeric = (
  regexp: RegExp,
  description: string,
  min: number | undefined = undefined,
  max: number | undefined = undefined,
  format: string | undefined = undefined,
  mask = '_',
  thousandSeparator = false,
  prefix = '',
  decimalScale: number | undefined = 0
): NumericPattern => ({
  inputType: 'numeric',
  regexp,
  description,
  decimalScale,
  min,
  max,
  format,
  mask,
  thousandSeparator,
  prefix
})

const text = (regexp: RegExp, description: string): TextPattern => ({
  inputType: 'text',
  regexp,
  description
})

export const isNumeric = (p: PatternConfig): p is NumericPattern =>
  p.inputType === 'numeric'
export const isText = (p: PatternConfig): p is TextPattern =>
  p.inputType === 'text'

export const Patterns = {
  number: numeric(/^\d+$/, 'Input should be a number'),
  year: numeric(
    /[12][0-9]{3}/,
    'Input should be a four digit year',
    1900,
    undefined,
    '####',
    '_'
  ),
  numMonths: numeric(/[0-9]{1,2}/, 'Input should be 0-12', 0, 12, '##', ''),
  numDays: (year: TaxYear): NumericPattern =>
    numeric(
      /[0-9]{1,3}/,
      `Input should be 0-${daysInYear(TaxYears[year])}`,
      0,
      daysInYear(TaxYears[year]),
      '###',
      ''
    ),
  name: text(/^[A-Za-z ]+$/i, 'Input should only include letters and spaces'),
  zip: numeric(
    /[0-9]{5}([0-9]{4})?/,
    'Input should be filled with 5 or 9 digits',
    undefined,
    undefined,
    '#####-####'
  ),
  ssn: numeric(
    /[0-9]{9}/,
    'Input should be filled with 9 digits',
    undefined,
    undefined,
    '###-##-####'
  ),
  ein: numeric(
    /[0-9]{9}/,
    'Input should be filled with 9 digits',
    undefined,
    undefined,
    '##-#######'
  ),
  currency: numeric(
    /[0-9]+(\.[0-9]{1,2})?/,
    'Input should be a numeric value',
    undefined,
    undefined,
    undefined,
    '_',
    true,
    '$',
    2
  ),
  bankAccount: numeric(
    /[0-9]{4,17}/,
    'Input should be filled with 4-17 digits',
    undefined,
    undefined,
    '#################',
    ''
  ),
  bankRouting: numeric(
    /[0-9]{9}/,
    'Input should be filled with 9 digits',
    undefined,
    undefined,
    '#########',
    '_'
  ),
  usPhoneNumber: numeric(
    /[2-9][0-9]{9}/,
    'Input should be 10 digits, not starting with 0 or 1',
    undefined,
    undefined,
    '(###) ###-####'
  ),
  plain: text(/.*/, '')
}
