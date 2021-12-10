import bundleForms from './bundleForms'
import buildYears from './buildYears'
import checkVersions from './env'

const main = async (): Promise<void> => {
  await bundleForms()
  await buildYears()
}

export default main

if (require.main === module) {
  checkVersions()
  main()
}
