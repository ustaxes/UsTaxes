import fs from 'fs'
import path from 'path'

const years = ['Y2020']
const src = (year: string): string =>
  path.join(__dirname, `../ustaxes-forms/${year}/public/`)

const dest = async (year: string): Promise<string> => {
  const destPath = path.join(__dirname, `../public/forms/${year}`)
  return new Promise((resolve, reject) => {
    if (fs.existsSync(destPath)) resolve(destPath)
    else
      fs.mkdir(destPath, (err) =>
        err ?? undefined !== undefined ? reject(err) : resolve(destPath)
      )
  })
}

const copy = async (src: string, dest: string): Promise<void> =>
  new Promise((resolve, reject) => {
    fs.cp(src, dest, { recursive: true }, (err) =>
      (err ?? undefined) !== undefined ? reject(err) : resolve()
    )
  })

const copyYear = async (year: string): Promise<void> =>
  copy(src(year), await dest(year))

if (require.main === module) {
  Promise.all(years.map(copyYear)).then(() => console.log('done'))
}
