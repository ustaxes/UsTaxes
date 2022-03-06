import { FilingStatus } from 'ustaxes/core/data'
import { computeOrdinaryTax } from '../irsForms/TaxTable'

describe('Tax rates', () => {
  it('ordinary taxes for single status should be correct', async () => {
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 5))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 14))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 2075))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 2099))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 9949))).toEqual(993)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 9950))).toEqual(998)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 10000))).toEqual(1004)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 13700))).toEqual(1448)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 13749))).toEqual(1448)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 37000))).toEqual(4244)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 37049))).toEqual(4244)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 50000))).toEqual(6754)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 50049))).toEqual(6754)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 75000))).toEqual(12254)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 75049))).toEqual(12254)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 99950))).toEqual(18015)
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 99999))).toEqual(18015)

    // Over $100,000
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 100000))).toEqual(
      18021
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 164925))).toEqual(
      33603
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 164926))).toEqual(
      33603
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 209425))).toEqual(
      47843
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 209426))).toEqual(
      47843
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 523600))).toEqual(
      157804
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.S, 523601))).toEqual(
      157805
    )
  })

  it('ordinary taxes for married filing jointly status should be correct', async () => {
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 5))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 14))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 2075))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 2099))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 9949))).toEqual(993)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 9950))).toEqual(998)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 10000))).toEqual(
      1003
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 13700))).toEqual(
      1373
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 13749))).toEqual(
      1373
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 37000))).toEqual(
      4045
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 37049))).toEqual(
      4045
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 50000))).toEqual(
      5605
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 50049))).toEqual(
      5605
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 75000))).toEqual(
      8605
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 75049))).toEqual(
      8605
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 99950))).toEqual(
      13492
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 99999))).toEqual(
      13492
    )

    // Over $100,000
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 100000))).toEqual(
      13497
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 172750))).toEqual(
      29502
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 172751))).toEqual(
      29502
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 329850))).toEqual(
      67206
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 329851))).toEqual(
      67206
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 418850))).toEqual(
      95686
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 418851))).toEqual(
      95686
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 628300))).toEqual(
      168994
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFJ, 628301))).toEqual(
      168994
    )
  })

  it('ordinary taxes for married filing separately status should be correct', async () => {
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 5))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 14))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 2075))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 2099))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 9949))).toEqual(993)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 9950))).toEqual(998)
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 10000))).toEqual(
      1004
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 13700))).toEqual(
      1448
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 13749))).toEqual(
      1448
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 37000))).toEqual(
      4244
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 37049))).toEqual(
      4244
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 50000))).toEqual(
      6754
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 50049))).toEqual(
      6754
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 75000))).toEqual(
      12254
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 75049))).toEqual(
      12254
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 99950))).toEqual(
      18015
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 99999))).toEqual(
      18015
    )

    // Over $100,000
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 100000))).toEqual(
      18021
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 164925))).toEqual(
      33603
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 164926))).toEqual(
      33603
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 209425))).toEqual(
      47843
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 209426))).toEqual(
      47843
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 314150))).toEqual(
      84497
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.MFS, 314151))).toEqual(
      84497
    )
  })

  it('ordinary taxes for head of household status should be correct', async () => {
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 5))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 14))).toEqual(1)
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 2075))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 2099))).toEqual(209)
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 9949))).toEqual(993)
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 9950))).toEqual(998)
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 10000))).toEqual(
      1003
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 13700))).toEqual(
      1373
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 13749))).toEqual(
      1373
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 37000))).toEqual(
      4159
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 37049))).toEqual(
      4159
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 50000))).toEqual(
      5719
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 50049))).toEqual(
      5719
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 75000))).toEqual(
      10802
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 75049))).toEqual(
      10802
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 99950))).toEqual(
      16563
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 99999))).toEqual(
      16563
    )

    // Over $100,000
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 100000))).toEqual(
      16569
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 164900))).toEqual(
      32145
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 164901))).toEqual(
      32145
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 209400))).toEqual(
      46385
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 209401))).toEqual(
      46385
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 523600))).toEqual(
      156355
    )
    expect(Math.round(computeOrdinaryTax(FilingStatus.HOH, 523601))).toEqual(
      156355
    )
  })
})
