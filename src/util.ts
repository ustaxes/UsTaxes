/**
 * Given a typescript enum, use this to get an array of the keys
 * to the enum
 * @param a Enumerator name
 * @returns tyepsafe array of keys
 */

export const enumKeys = <A>(a: A): Array<keyof typeof a> =>
  Object.keys(a).filter((k) => isNaN(Number(k))) as Array<keyof typeof a>

export const linear =
  (m: number, b: number) =>
  (x: number): number =>
    b + m * x

// Lower bound, and function to apply above that bound.
interface Piece {
  lowerBound: number
  f: (x: number) => number
}
export type Piecewise = Piece[]

export const evaluatePiecewise = (f: Piecewise, x: number): number => {
  // Select the function segment to evaulate.
  // The function segment is the one before the segment with the lower bound above x.
  const selection: number = (() => {
    const idx = f.findIndex(({ lowerBound }) => lowerBound > x)
    if (idx < 0) {
      return f.length - 1
    }
    return idx - 1
  })()
  return f[selection].f(x)
}

export const isLeapYear = (year: number): boolean =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0

export const daysInYear = (year: number): number =>
  isLeapYear(year) ? 366 : 365

export const ifNegative = <A = number>(
  n: number,
  orElse: A | number = 0
): A | number => (n < 0 ? n : orElse)

export const ifPositive = <A = number>(
  n: number,
  orElse: A | number = 0
): A | number => (n > 0 ? n : orElse)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isDesktop = (): boolean => (window as any).__TAURI__ !== undefined

export const isWeb = (): boolean => !isDesktop()
