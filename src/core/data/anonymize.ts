import { YearsTaxesState } from 'ustaxes/redux'
import {
  F3921,
  Ira,
  Supported1099,
  Dependent,
  Employer,
  F1098e,
  Information,
  Person,
  PersonRole,
  TaxPayer,
  Address,
  IncomeW2,
  Property,
  ScheduleK1Form1065
} from '.'

const anonymizePerson = (person: Person): Person => {
  const roles = [
    PersonRole.PRIMARY,
    PersonRole.SPOUSE,
    PersonRole.DEPENDENT,
    PersonRole.EMPLOYER
  ]

  return {
    ...person,
    ssid: `${100000000 + roles.findIndex((r) => r === person.role)}`,
    firstName: `${person.role}first`,
    lastName: `${person.role}last`
  }
}

const anonymizeDependent = (dependent: Dependent, idx: number): Dependent => {
  return {
    ...dependent,
    ...anonymizePerson(dependent),
    ssid: `${200000000 + idx}`,
    firstName: `dependent-${idx}-first`,
    lastName: `dependent-${idx}-first`
  }
}

const anonymizeAddress = (address: Address, prefix = ''): Address => ({
  ...address,
  address: `${prefix} address`,
  city: `${prefix} city`,
  aptNo: address.aptNo !== undefined ? `${prefix} apt` : undefined,
  zip: address.zip !== undefined ? '99999' : undefined,
  foreignCountry:
    address.foreignCountry === undefined
      ? undefined
      : `${prefix} foreign country`,
  postalCode: address.postalCode !== undefined ? `${prefix} postal` : undefined,
  province: address.province !== undefined ? `${prefix} province` : undefined
})

const anonymizeEmployer = (employer: Employer): Employer => ({
  ...employer,
  EIN: '999999999',
  employerName: 'anonymous employer',
  address:
    employer.address === undefined
      ? undefined
      : anonymizeAddress(employer.address, 'employer')
})

const anonymizeF1098e = (f: F1098e): F1098e => ({
  ...f,
  lender: 'lender'
})

const anonymizeF1099 = (f: Supported1099, idx: number): Supported1099 => ({
  ...f,
  payer: `payer ${idx}`
})

const anonymizeF3921 = (f: F3921, idx: number): F3921 => ({
  ...f,
  name: `3921 name ${idx}`
})

const anonymizeIra = (ira: Ira, idx: number): Ira => ({
  ...ira,
  payer: `ira payer ${idx}`
})

const anonymizeTaxPayer = (tp: TaxPayer): TaxPayer => ({
  ...tp,
  contactEmail: tp.contactEmail === undefined ? undefined : 'a@b.com',
  contactPhoneNumber:
    tp.contactPhoneNumber === undefined ? undefined : '1234567890',
  dependents: tp.dependents.map(anonymizeDependent),
  primaryPerson:
    tp.primaryPerson === undefined
      ? undefined
      : { ...tp.primaryPerson, ...anonymizePerson(tp.primaryPerson) },
  spouse:
    tp.spouse === undefined
      ? undefined
      : { ...tp.spouse, ...anonymizePerson(tp.spouse) }
})

const anonymizeW2 = (w2: IncomeW2): IncomeW2 => ({
  ...w2,
  employer:
    w2.employer === undefined ? undefined : anonymizeEmployer(w2.employer),
  occupation: 'occupation'
})

const anonymizeRealEstate = (realEstate: Property): Property => ({
  ...realEstate,
  address: anonymizeAddress(realEstate.address, 'property')
})

const anonymizeK1 = (
  k1: ScheduleK1Form1065,
  idx: number
): ScheduleK1Form1065 => ({
  ...k1,
  partnershipName: `partnership ${idx}`,
  partnershipEin: '888888888'
})

export const anonymizeInformation = (info: Information): Information => ({
  ...info,
  f1098es: info.f1098es.map(anonymizeF1098e),
  f1099s: info.f1099s.map(anonymizeF1099),
  f3921s: info.f3921s.map(anonymizeF3921),
  individualRetirementArrangements:
    info.individualRetirementArrangements.map(anonymizeIra),
  refund:
    info.refund === undefined
      ? undefined
      : {
          ...info.refund,
          accountNumber: '123456789',
          routingNumber: '123456789'
        },
  taxPayer: anonymizeTaxPayer(info.taxPayer),
  w2s: info.w2s.map(anonymizeW2),
  realEstate: info.realEstate.map(anonymizeRealEstate),
  scheduleK1Form1065s: info.scheduleK1Form1065s.map(anonymizeK1)
})

export default (input: YearsTaxesState): YearsTaxesState => ({
  ...input,
  Y2019: anonymizeInformation(input.Y2019),
  Y2020: anonymizeInformation(input.Y2020),
  Y2021: anonymizeInformation(input.Y2021)
})
