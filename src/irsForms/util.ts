export const displayNumber = (n: number | undefined): number | undefined => {
  if (n === undefined || n <= 0) {
    return undefined
  }
  return Math.round(n)
}

export const displayNegPos = (n: number | undefined): string => {
  if (n === undefined || n === 0) return ''
  if (n < 0) return `(${Math.abs(n)})`
  return n.toString()
}

export const computeField = (f: number | undefined): number =>
  f === undefined ? 0 : f

export const sumFields = (fs: Array<number | undefined>): number =>
  fs.map((f) => computeField(f)).reduce((l, r) => l + r, 0)
