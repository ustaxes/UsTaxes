import fs from 'fs/promises'
import { spawn } from 'child_process'
import path from 'path'
import { supportedYears } from './env'

const ci = async (year: string): Promise<void> =>
  new Promise((resolve, reject) => {
    spawn('npm', ['ci'], {
      cwd: path.resolve(__dirname, `../ustaxes-forms/${year}`)
    }).on('close', (code: number): void => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Failed to run npm ci for ${year}, exit code ${code}`))
      }
    })
  })

const buildYear = async (year: string): Promise<void> =>
  new Promise((resolve, reject) => {
    spawn('pwd')
    spawn('npx', [
      'tsc',
      '-b',
      path.resolve(__dirname, `../ustaxes-forms/${year}/tsconfig.json`)
    ]).on('close', (code: number): void => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Failed to build ${year}, exit code ${code}`))
      }
    })
  })

const linkBuiltDirectories = async (year: string): Promise<void> => {
  const cwd = path.resolve(__dirname, '../src/forms')
  fs.access(path.resolve(cwd, year)).catch((): Promise<void> => {
    const isWindows = process.platform === 'win32'
    return new Promise((resolve, reject) => {
      const target = `../../ustaxes-forms/${year}/dist/src`
      const [linkCommand, ...linkArgs] = isWindows
        ? ['mklink', '/D', year, target]
        : ['ln', '-s', '-f', target, year]

      spawn(linkCommand, linkArgs, { cwd }).on(
        'close',
        (code: number): void => {
          if (code === 0) {
            resolve()
          } else {
            reject(
              new Error(`Failed to link dist for ${year}, exit code ${code}`)
            )
          }
        }
      )
    })
  })
}

const main = async (): Promise<void> => {
  console.info('Running npm ci for each submodule')
  await Promise.all(supportedYears.map(ci))
  console.info('Building each submodule with tsc')
  await Promise.all(supportedYears.map(buildYear))
  console.info('Linking each built submodule')
  await Promise.all(supportedYears.map(linkBuiltDirectories))
  console.info('Done!')
}

export default main

if (require.main === module) main()
