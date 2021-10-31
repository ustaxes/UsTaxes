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

// idea from https://github.com/gcanti/fp-ts/blob/3e2af038982cb4090ccc8c2912e4b22f907bdaea/src/Either.ts
export interface Left<E> {
  readonly _tag: 'left'
  left: E
}

export interface Right<A> {
  readonly _tag: 'right'
  right: A
}

export type Either<E, A> = Left<E> | Right<A>

export const left = <E = never, A = never>(left: E): Either<E, A> => ({
  _tag: 'left',
  left
})
export const right = <E = never, A = never>(right: A): Either<E, A> => ({
  _tag: 'right',
  right
})

export const isLeft = <E, A>(e: Either<E, A>): e is Left<E> => e._tag === 'left'
export const isRight = <E, A>(e: Either<E, A>): e is Right<A> =>
  e._tag === 'right'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isDesktop = (): boolean => (window as any).__TAURI__ !== undefined

export const isWeb = (): boolean => !isDesktop()
