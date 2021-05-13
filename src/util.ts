
/**
 * Given a typescript enum, use this to get an array of the keys
 * to the enum
 * @param a Enumerator name
 * @returns tyepsafe array of keys
 */
export const enumKeys = <A extends Object>(a: A): Array<keyof typeof a> =>
  Object.keys(a).filter((k) => isNaN(Number(k))) as Array<keyof typeof a>

export const anArrayOf = <A>(n: number, a: A): A[] => Array.from(Array(n)).map(() => a)

export const range = (from: number, to: number): number[] =>
  anArrayOf(to - from, undefined).map((_, i) => from + i)

/**
 * Given two arrays [a1, a2, ...], [b1, b2, ...] make an array
 * [[a1, b1], [a2, b2], ...]
 * Throws an error if bs is shorter than as, truncates if bs is larger.
 */
export const zip = <A, B>(as: A[], bs: B[]): Array<[A, B]> =>
  as.map((a, i) => [a, bs[i]])

/**
 * Given three arrays [a1, a2, ...], [b1, b2, ...],
 * [c1, c2, ...] make an array
 * [[a1, b1, c1], [a2, b2, c2], ...]
 * Throws an error if bs is shorter than as, or cs is shorter than bs
 */
export const zip3 = <A, B, C>(as: A[], bs: B[], cs: C[]): Array<[A, B, C]> =>
  zip(as, zip(bs, cs)).map(([a, [b, c]]) => [a, b, c])

export const linear = (m: number, b: number) => (x: number): number => b + m * x

// Lower bound, and function to apply above that bound.
export type Piecewise = Array<[number, ((x: number) => number)]>

export const evaluatePiecewise = (f: Piecewise, x: number): number => {
  // Select the function segment to evaulate.
  // The function segment is the one before the segment with the lower bound above x.
  const selection: number = (() => {
    const idx = f.findIndex(([lowerBound]) => lowerBound > x)
    if (idx < 0) {
      return f.length - 1
    }
    return idx - 1
  })()
  return f[selection][1](x)
}

export const unzip = <A, B>(xs: Array<[A, B]>): [A[], B[]] =>
  xs.reduce<[A[], B[]]>(([as, bs], [a, b]) => [[...as, a], [...bs, b]], [[], []])

export const unzip3 = <A, B, C>(xs: Array<[A, B, C]>): [A[], B[], C[]] =>
  xs.reduce<[A[], B[], C[]]>(([as, bs, cs], [a, b, c]) => [[...as, a], [...bs, b], [...cs, c]], [[], [], []])

/**
 * Split an array of elements into an array of n arrays.
 * @param n number of segments to produce
 * @param xs array of items
 * @returns array of n arrays of items
 */
export const segments = <A>(n: number, xs: A[]): A[][] => {
  const size: number = Math.ceil(xs.length / n)
  return anArrayOf(n, undefined).map((_, i) => xs.slice(i * size, (i + 1) * size))
}

export const isLeapYear = (year: number): boolean => {
  return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)
}

export const daysInYear = (year: number): number =>
  isLeapYear(year) ? 366 : 365

export const ifNegative = <A = number>(n: number, orElse: A | number = 0): A | number =>
  n < 0 ? n : orElse

export const ifPositive = <A = number>(n: number, orElse: A | number = 0): A | number =>
  n > 0 ? n : orElse

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

export const left = <E = never, A = never>(left: E): Either <E, A> => ({ _tag: 'left', left })
export const right = <E = never, A = never>(right: A): Either<E, A> => ({ _tag: 'right', right })

export const isLeft = <E, A>(e: Either<E, A>): e is Left<E> => e._tag === 'left'
export const isRight = <E, A>(e: Either<E, A>): e is Right<A> => e._tag === 'right'
