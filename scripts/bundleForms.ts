import fs from 'fs/promises'
import path from 'path'

// fs.cp since 16.7
const requiredNodeVersion = [16, 7]

const checkVersion = () => {
  const [M, m] = process.version.split('.').map((x) => parseInt(x, 10))
  const [R, r] = requiredNodeVersion
  if (M < R || (M === R && m < r)) {
    console.error('Required node version not found.')
    console.error(`Required: >= ${requiredNodeVersion.join('.')}`)
    console.error(`Found:       ${process.version}`)
    process.exit(1)
  }
}

const years = ['Y2020']
const src = (year: string): string =>
  path.join(__dirname, `../ustaxes-forms/${year}/public/`)

const dest = async (year: string): Promise<string> => {
  const destPath = path.join(__dirname, `../public/forms/${year}`)
  await fs.access(destPath).catch(() => fs.mkdir(destPath, { recursive: true }))
  return destPath
}

const copyYear = async (year: string): Promise<void> => {
  const from = src(year)
  const to = await dest(year)

  return fs.cp(from, to, { recursive: true })
}

if (require.main === module) {
  checkVersion()
  Promise.all(years.map(async (y) => copyYear(y))).then(() =>
    console.log('done')
  )
}
