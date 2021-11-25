// fs.cp since 16.7
export const requiredNodeVersion = [16, 7]
export const supportedYears = ['Y2020', 'Y2021']

export const checkVersion = (): void => {
  const [M, m] = process.version
    .slice(1) // drop 'v'
    .split('.') // split into major and minor
    .map((x) => parseInt(x, 10))
  const [R, r] = requiredNodeVersion
  if (M < R || (M === R && m < r)) {
    const requiredStr = requiredNodeVersion.join('.')
    const line = (msg: string): string => `| ${msg}`.padEnd(50) + '|'

    const border = `|${Array.from(Array(49))
      .map(() => '-')
      .join('')}|`

    console.error(
      [
        border,
        line('Required node version not found.'),
        line(`Required: >= ${requiredStr}`),
        line(`Found:       ${process.version}`),
        line('Consider using nvm: https://nvm.sh'),
        border
      ].join('\n')
    )

    process.exit(1)
  }
}
