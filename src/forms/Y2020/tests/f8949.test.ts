import { testKit } from '.'

describe('f8949', () => {
  it('should attach 8949 if there are sales this year', async () => {
    await testKit.with1040Assert((forms, info, assets): Promise<void> => {
      if (
        assets.filter((p) => p.closeDate?.getFullYear() === 2020).length > 0
      ) {
        expect(forms.filter((s) => s.tag === 'f8949').length).toBeGreaterThan(0)
      }
      return Promise.resolve()
    })
  })
})
