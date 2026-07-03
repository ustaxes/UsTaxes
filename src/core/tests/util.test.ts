import { parseFormNumber, parseFormNumberOrThrow } from '../util'

describe('parseFormNumber', () => {
  it('parses valid numeric strings', () => {
    expect(parseFormNumber('123')).toBe(123)
    expect(parseFormNumber('12.5')).toBe(12.5)
    expect(parseFormNumber('0')).toBe(0)
    expect(parseFormNumber('-4')).toBe(-4)
    expect(parseFormNumber('1e3')).toBe(1000)
  })

  it('returns undefined for empty or absent input', () => {
    expect(parseFormNumber('')).toBeUndefined()
    expect(parseFormNumber(undefined)).toBeUndefined()
  })

  it('returns undefined (not NaN) for non-numeric input', () => {
    expect(parseFormNumber('abc')).toBeUndefined()
    expect(parseFormNumber('   ')).toBeUndefined()
  })
})

describe('parseFormNumberOrThrow', () => {
  it('returns the parsed number for valid input', () => {
    expect(parseFormNumberOrThrow('42')).toBe(42)
  })

  it('throws on non-numeric input instead of returning NaN', () => {
    expect(() => parseFormNumberOrThrow('abc')).toThrow()
    expect(() => parseFormNumberOrThrow('')).toThrow()
  })
})
