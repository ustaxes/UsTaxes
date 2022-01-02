import { testKit, commonTests } from '.'

jest.setTimeout(40000)

beforeAll(() => {
  jest.spyOn(console, 'warn').mockImplementation((x: string) => {
    if (!x.includes('Removing XFA form data as pdf-lib')) {
      console.warn(x)
    }
  })
})

describe('f1040', () => {
  commonTests.run()

  // TODO: revisit this test. Commented it out because it will fail
  // under certain seemingly legit circumstances. For example, if there
  // is no income from W2 or 1099 but an excess distribution from a HSA
  // is done, then there will be more tax than income.
  // it('should never produce higher tax than income', async () => {
  //   await testKit.with1040Assert(async (forms) => {
  //     const f1040 = commonTests.findF1040(forms)
  //     expect(f1040).not.toBeUndefined()
  //     if (f1040 !== undefined) {
  //       // tax is less than taxable income
  //       if (f1040.l15() ?? 0 > 0) {
  //         expect(f1040.l24() ?? 0).toBeLessThan(f1040.l15() ?? 0)
  //       } else {
  //         expect(f1040.l24() ?? 0).toEqual(0)
  //       }
  //     }
  //   })
  // })
})
