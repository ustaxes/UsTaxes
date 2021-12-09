import { checkVersion } from './env'
import { spawn } from 'child_process'
import path from 'path'
import { supportedYears } from './env'

const projectDir = path.resolve(__dirname, '../')

// Expects passed directory to be at the root of this project
// (directory containing scripts directory)
const spawnToClose = (
  command: string,
  args: string[],
  inDir?: string
): Promise<void> => {
  const cwd = inDir ? path.resolve(projectDir, inDir) : projectDir

  console.log(`Running ${command} ${args.join(' ')} in ${cwd}`)

  return new Promise((resolve, reject) =>
    spawn(command, args, {
      cwd
    }).on('close', (code: number): void => {
      if (code !== 0) {
        reject(
          new Error(
            `in ${inDir}, ${command} ${args.join(' ')} failed with code ${code}`
          )
        )
      } else {
        resolve()
      }
    })
  )
}

const ciProject = async (dir: string): Promise<void> =>
  spawnToClose('npm', ['ci'], dir)

const ci = async (year: string): Promise<void> =>
  ciProject(`ustaxes-forms/${year}`)

export const ciCore = async (): Promise<void> => ciProject('ustaxes-core')

const buildYear = async (year: string): Promise<void> =>
  spawnToClose('npx', ['tsc'], `ustaxes-forms/${year}`)

const buildCore = async (): Promise<void> => {
  spawnToClose('npx', ['tsc'], 'ustaxes-core')
}

const runSetupScript = async (dir: string): Promise<void> =>
  spawnToClose('npx', ['ts-node', './scripts/setup.ts'], dir)

const runSetupScriptYear = async (year: string): Promise<void> =>
  runSetupScript(`ustaxes-forms/${year}`)

const main = async (): Promise<void> => {
  console.info('Running npm ci for each submodule')
  await Promise.all(supportedYears.map(ci))
  console.info('Running setup script for core')
  await runSetupScript('./ustaxes-core')
  console.info('Running setup script for each supported year')
  await Promise.all(supportedYears.map(runSetupScriptYear))
  console.info('Building each submodule with tsc')
  await Promise.all([buildCore(), ...supportedYears.map(buildYear)])
  console.info('Done!')
}

export default main

if (require.main === module) {
  checkVersion()
  main()
}
