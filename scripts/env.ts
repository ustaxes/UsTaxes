import { exec } from 'child_process'

// fs.cp since 16.7
export const requiredNodeVersion = [16, 7]
export const requiredNpmVersion = [8, 0]
export const supportedYears = ['Y2020', 'Y2021']

const showError = (...errLines: string[]): void => {
  const maxLineLen = 78
  const displayError = errLines.map((err) => {
    if (err.length > maxLineLen) {
      const words = err.split(' ')
      return words
        .reduce(
          (lines, word) => {
            if (lines.length + 1 + word.length > maxLineLen) {
              return [...lines, word]
            } else {
              return [...lines, lines[lines.length - 1] + ' ' + word]
            }
          },
          ['']
        )
        .join('\n')
    }
    return err
  })

  const lineLen = Math.min(
    maxLineLen,
    Math.max(...displayError.map((x) => x.length))
  )

  const line = (msg: string): string => `| ${msg}`.padEnd(lineLen + 2) + ' |'

  const border = `|${Array.from(Array(lineLen + 2))
    .map(() => '-')
    .join('')}|`

  console.error([border, ...displayError.map(line), border].join('\n'))
}

export const checkVersion = (): void => {
  const [M, m] = process.version
    .slice(1) // drop 'v'
    .split('.') // split into major and minor
    .map((x) => parseInt(x, 10))
  const [R, r] = requiredNodeVersion
  if (M < R || (M === R && m < r)) {
    const requiredStr = requiredNodeVersion.join('.')

    showError(
      'Required node version not found.',
      `Required: >= ${requiredStr}`,
      `Found:       ${process.version}`,
      'Consider using nvm: https://nvm.sh'
    )

    process.exit(1)
  }
}

const getNpmVersion = (): Promise<[number, number]> => {
  return new Promise((resolve, reject) => {
    exec('npm --version', (error, stdout) => {
      if (error) {
        reject(error)
      } else {
        const [major, minor] = stdout
          .trim()
          .split('.')
          .map((x) => parseInt(x, 10))
        resolve([major, minor])
      }
    })
  })
}

export const checkNpmVersion = async (): Promise<void> => {
  const [major, minor] = await getNpmVersion()
  const [R, r] = requiredNpmVersion

  if (major < R || (major === R && minor < r)) {
    const requiredStr = requiredNpmVersion.join('.')

    showError(
      'Required npm version not found.',
      `Required: >= ${requiredStr}`,
      `Found:       ${major}.${minor}`,
      'Consider using nvm: https://nvm.sh'
    )

    process.exit(1)
  }
}

const main = async (): Promise<void> => {
  await checkNpmVersion()
  checkVersion()
}

export default main

if (require.main === module) {
  main()
}
