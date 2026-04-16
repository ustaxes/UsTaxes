import F1040 from '../irsForms/F1040'
import { FilingStatus, Information, PersonRole } from 'ustaxes/core/data'
import { validate } from 'ustaxes/forms/F1040Base'
import { run } from 'ustaxes/core/util'
import { blankState } from 'ustaxes/redux/reducer'

const baseInformation: Information = {
  ...blankState,
  taxPayer: {
    filingStatus: FilingStatus.S,
    primaryPerson: {
      firstName: 'Taylor',
      lastName: 'Taxpayer',
      ssid: '123456789',
      role: PersonRole.PRIMARY,
      isBlind: false,
      dateOfBirth: new Date(1990, 0, 1),
      isTaxpayerDependent: false,
      address: {
        address: '123 Maple St',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      }
    },
    dependents: []
  },
  businesses: [
    {
      name: 'Side Gig LLC',
      principalBusinessOrProfession: 'Consulting',
      businessCode: '541611',
      ein: '123456789',
      address: {
        address: '456 Oak Ave',
        city: 'Austin',
        state: 'TX',
        zip: '78702'
      },
      income: {
        grossReceipts: 12000,
        returnsAndAllowances: 500,
        otherIncome: 250
      },
      expenses: {
        advertising: 300,
        office: 450,
        utilities: 1000
      },
      homeOfficeDeduction: 750
    }
  ],
  selfEmployedIncome: [
    {
      businessName: 'Side Gig LLC',
      personRole: PersonRole.PRIMARY,
      grossReceipts: 11750,
      expenses: 2500,
      healthInsurancePremiums: 900
    }
  ]
}

const makeF1040 = (info: Information = baseInformation): F1040 =>
  run(validate(info)).fold(
    (errors) => {
      throw new Error(`Validation failed: ${String(errors)}`)
    },
    (validInfo) => new F1040(validInfo, [])
  )

describe('Schedule C (2025)', () => {
  it('fills identifying fields and core totals for the printed PDF', () => {
    const scheduleC = makeF1040().scheduleC
    expect(scheduleC).not.toBeUndefined()
    if (scheduleC === undefined) {
      throw new Error('Expected Schedule C to be created')
    }

    const instructions = scheduleC.fillInstructions()
    const valuesByName = new Map(
      instructions.map((instruction) => [instruction.name, instruction.value])
    )

    expect(scheduleC.fields()).toEqual(
      instructions.map((instruction) => instruction.value)
    )

    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_3[0]')).toBe(
      'Consulting'
    )
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_5[0]')).toBe(
      'Side Gig LLC'
    )
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_7[0]')).toBe(
      '456 Oak Ave'
    )
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_8[0]')).toBe(
      'Austin, TX, 78702'
    )
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_10[0]')).toBe(12000)
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_41[0]')).toBe(1750)
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_45[0]')).toBe(750)
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_46[0]')).toBe(9250)
  })

  it('synthesizes printable Schedule C values from self-employed income when no business record exists', () => {
    const scheduleC = makeF1040({
      ...baseInformation,
      businesses: []
    }).scheduleC
    expect(scheduleC).not.toBeUndefined()
    if (scheduleC === undefined) {
      throw new Error('Expected Schedule C to be created')
    }

    const valuesByName = new Map(
      scheduleC
        .fillInstructions()
        .map((instruction) => [instruction.name, instruction.value])
    )

    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_5[0]')).toBe(
      'Side Gig LLC'
    )
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_10[0]')).toBe(11750)
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_41[0]')).toBe(2500)
    expect(valuesByName.get('topmostSubform[0].Page1[0].f1_46[0]')).toBe(9250)
  })
})
