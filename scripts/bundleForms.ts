import fs from 'fs/promises'
import path from 'path'
import { checkVersion } from './env'
import { supportedYears } from './env'

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

const main = async (): Promise<void> => {
  checkVersion()
  console.log(`Moving forms into public folder for all supported years.`)
  await Promise.all(supportedYears.map(async (y) => copyYear(y)))
}

export default main

if (require.main === module) {
  checkVersion()
  main()
}
