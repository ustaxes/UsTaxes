import bundleForms from './bundleForms'
import buildYears from './buildYears'

const main = async (): Promise<void> => {
  await bundleForms()
  await buildYears()
}

export default main

if (require.main === module) main()
