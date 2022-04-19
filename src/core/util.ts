/**
 * Given a typescript enum, use this to get an array of the keys
 * to the enum
 * @param a Enumerator name
 * @returns tyepsafe array of keys
 */

import _ from 'lodash'
import { DeepMap, DeepPartial } from 'react-hook-form'

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

// FP style Either type that also handles promises.
export class EitherMethods<E, A> {
  e: Either<E, A>

  constructor(e: Either<E, A>) {
    this.e = e
  }

  map = <B>(f: (a: A) => B): EitherMethods<E, B> =>
    isLeft(this.e) ? pureLeft(this.e.left) : pure(f(this.e.right))

  ap = <B>(fab: Either<E, (a: A) => B>): EitherMethods<E, B> =>
    isLeft(fab) ? new EitherMethods(left(fab.left)) : this.map(fab.right)

  chain = <B>(f: (a: A) => Either<E, B>): EitherMethods<E, B> =>
    new EitherMethods(isLeft(this.e) ? left(this.e.left) : f(this.e.right))

  mapLeft = <E2>(f: (err: E) => E2): EitherMethods<E2, A> =>
    isLeft(this.e) ? pureLeft(f(this.e.left)) : pure(this.e.right)

  fold = <B, C>(f: (e: E) => B, g: (a: A) => C): B | C =>
    isLeft(this.e) ? f(this.e.left) : g(this.e.right)

  orThrow = (): A =>
    this.fold(
      (e) => {
        throw e
      },
      (a) => a
    )

  handle = <B>(f: (e: E) => B): B | undefined => this.fold(f, () => undefined)

  mapAsync = async <B>(
    f: (a: A) => Promise<B>
  ): Promise<EitherMethods<E, B>> => {
    if (isLeft(this.e)) {
      return Promise.resolve(pureLeft(this.e.left))
    } else {
      return pure(await f(this.e.right))
    }
  }

  value = (): Either<E, A> => this.e
}

export const pureLeft = <A, E = unknown>(e: E): EitherMethods<E, A> =>
  new EitherMethods(left(e))
export const pure = <E, A = unknown>(a: A): EitherMethods<E, A> =>
  new EitherMethods<E, A>(right(a))
export const run = <E, A>(e: Either<E, A>): EitherMethods<E, A> =>
  new EitherMethods(e)
export const runAsync = <E, A>(
  e: Promise<Either<E, A>>
): Promise<EitherMethods<E, A>> => e.then(run)

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access
export const isDesktop = (): boolean => (window as any).__TAURI__ !== undefined

export const isWeb = (): boolean => !isDesktop()

// Decimal precision

const fixDecimals =
  (n: number) =>
  (x: number): number => {
    const mul = Math.pow(10, n)
    return Math.round(x * mul) / mul
  }

export const fix2 = fixDecimals(2)
export const fix0 = (n: number): number => Math.round(n)
export const fix5 = fixDecimals(5)
export const fix10 = fixDecimals(10)

export const parseFormNumber = (x: string | undefined): number | undefined => {
  if (x !== undefined && x.length > 0) {
    try {
      return parseFloat(x)
    } catch (e) {
      return undefined
    }
  }
  return undefined
}

export const parseFormNumberOrThrow = (x: string | undefined): number => {
  const res = parseFormNumber(x)
  if (res === undefined) {
    throw new Error(`${x ?? 'undefined'} does not parse to number`)
  }
  return res
}

export const numberOfDaysBetween = (d1: Date, d2: Date): number => {
  const [start, end] = [d1, d2].map((d) =>
    // Ignore time part if it exists.
    new Date(d.toISOString().slice(0, 10)).getTime()
  )
  return Math.abs(end - start) / 1000 / 60 / 60 / 24
}

export const nextMultipleOf =
  (mul: number) =>
  (value: number): number => {
    const v = Math.round(value)
    // Just return the highest possible value divisible by mul
    // if we're above this number (~9E15)
    // Above that mod cannot be expected to return correct results
    if (v > Number.MAX_SAFE_INTEGER - mul) {
      return Number.MAX_SAFE_INTEGER - (Number.MAX_SAFE_INTEGER % mul)
    }

    return Math.ceil(v / mul) * mul
  }

export const nextMultipleOf1000 = nextMultipleOf(1000)

/**
 * https://github.com/typescript-eslint/typescript-eslint/issues/4619#issuecomment-1055653098
 *
 * Mark a promise as intentionally floating, not awaited.
 *
 * In react, we often want to do something asynchronous as a result
 * of a user action, such as when there is an onClick to handle. onClick
 * expects a function that returns void. But in these asynchronous cases
 * we have a promise with no one around to await it. So explicitly mark
 * this use as acceptable by wrapping the handler in this function.
 */
export const intentionallyFloat = <A extends unknown[]>(
  fn: (...args: A) => Promise<unknown>
): ((...args: A) => void) => {
  return (...args) => {
    void fn(...args)
  }
}

export const getNestedValue = <A, E, V>(
  obj: DeepMap<DeepPartial<A>, E>,
  path: string,
  defaultValue: V
): E | V => _.get(obj, path, defaultValue) as E | V
