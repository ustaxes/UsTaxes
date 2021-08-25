export const displayNumber = (n: number): number | undefined => {
  if (n <= 0) {
    return undefined
  }
  return Math.round(n)
}

export const displayNegPos = (n: number): string => {
  if (n < 0) {
    return `(${Math.abs(n)})`
  } else if (n === 0) {
    return ''
  }
  return n.toString()
}

export const computeField = (f: number | undefined): number =>
  f === undefined ? 0 : f

export const sumFields = (fs: Array<number | undefined>): number =>
  fs.map((f) => computeField(f)).reduce((l, r) => l + r, 0)
