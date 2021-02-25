
export const anArrayOf = <A>(n: number, a: A): A[] => Array.from(Array(n)).map(() => a)

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
