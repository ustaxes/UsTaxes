import F1040 from '../irsForms/F1040'
import { FilingStatus, Information, PersonRole } from 'ustaxes/core/data'
import { validate } from 'ustaxes/forms/F1040Base'
import { run } from 'ustaxes/core/util'
import { blankState } from 'ustaxes/redux/reducer'

const baseInformation: Information = {
  ...blankState,
  obbbDeductions: {
    electTrumpAccountContribution: true
  },
  taxPayer: {
    filingStatus: FilingStatus.S,
    contactPhoneNumber: '555-555-1212',
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
        city: 'Toronto',
        foreignCountry: 'Canada',
        province: 'ON',
        postalCode: 'A1A 1A1'
      }
    },
    dependents: [
      {
        firstName: 'Avery',
        lastName: 'Taxpayer',
        ssid: '111223333',
        role: PersonRole.DEPENDENT,
        isBlind: false,
        relationship: 'Child',
        dateOfBirth: new Date(2025, 1, 3),
        qualifyingInfo: {
          numberOfMonths: 11,
          isStudent: false
        }
      },
      {
        firstName: 'Blake',
        lastName: 'Taxpayer',
        ssid: '444556666',
        role: PersonRole.DEPENDENT,
        isBlind: false,
        relationship: 'Child',
        dateOfBirth: new Date(2025, 6, 4),
        qualifyingInfo: {
          numberOfMonths: 5,
          isStudent: false
        }
      }
    ]
  }
}

const makeF1040 = (info: Information = baseInformation): F1040 =>
  run(validate(info)).fold(
    (errors) => {
      throw new Error(`Validation failed: ${String(errors)}`)
    },
    (validInfo) => new F1040(validInfo, [])
  )

describe('F4547 (2025)', () => {
  it('is needed only when the election is made for at least one eligible child', () => {
    expect(makeF1040().f4547.isNeeded()).toBe(true)

    expect(
      makeF1040({
        ...baseInformation,
        obbbDeductions: { electTrumpAccountContribution: false }
      }).f4547.isNeeded()
    ).toBe(false)

    expect(
      makeF1040({
        ...baseInformation,
        taxPayer: {
          ...baseInformation.taxPayer,
          dependents: [
            {
              ...baseInformation.taxPayer.dependents[0],
              dateOfBirth: new Date(2024, 1, 3)
            }
          ]
        }
      }).f4547.isNeeded()
    ).toBe(false)
  })

  it('keeps positional fields aligned with fillInstructions and fills foreign address + phone', () => {
    const f4547 = makeF1040().f4547
    const instructions = f4547.fillInstructions()
    const valuesByName = new Map(
      instructions.map((instruction) => [instruction.name, instruction.value])
    )

    expect(f4547.fields()).toEqual(
      instructions.map((instruction) => instruction.value)
    )

    expect(
      valuesByName.get('form1[0].Page1[0].Address_ReadOrder[0].f1_10[0]')
    ).toBe('Canada')
    expect(
      valuesByName.get('form1[0].Page1[0].Address_ReadOrder[0].f1_11[0]')
    ).toBe('ON')
    expect(
      valuesByName.get('form1[0].Page1[0].Address_ReadOrder[0].f1_12[0]')
    ).toBe('A1A 1A1')
    expect(
      valuesByName.get('form1[0].Page1[0].Address_ReadOrder[0].f1_13[0]')
    ).toBe('555-555-1212')

    expect(
      valuesByName.get('form1[0].Page1[0].Table_Part2[0].Row4[0].f1_27[0]')
    ).toBe('07/04')
    expect(
      valuesByName.get('form1[0].Page1[0].Table_Part2[0].Row4[0].f1_28[0]')
    ).toBe('2025')
  })
})

