export const displayRound = (n: number): number | undefined =>
  Math.round(n) === 0 ? undefined : Math.round(n)

export const displayNegPos = (n: number | undefined): string => {
  const r = Math.round(n ?? 0)
  if (r === 0) return ''
  if (r < 0) return `(${Math.abs(r)})`
  return r.toString()
}

export const sumFields = (fs: Array<number | undefined>): number =>
  fs.reduce<number>((l, r) => l + (r ?? 0), 0)
