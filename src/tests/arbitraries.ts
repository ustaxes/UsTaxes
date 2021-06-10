import fc, { Arbitrary } from 'fast-check'
import { CURRENT_YEAR } from '../data/federal'
import locationPostalCodes from '../data/locationPostalCodes'
import F1040 from '../irsForms/F1040'
import Form from '../irsForms/Form'
import { create1040 } from '../irsForms/Main'
import * as types from '../redux/data'
import * as util from '../util'

const lower: Arbitrary<string> =
  fc.integer({ min: 0x61, max: 0x7a }).map((n) => String.fromCharCode(n))

const upper: Arbitrary<string> =
  fc.integer({ min: 0x41, max: 0x5a }).map((n) => String.fromCharCode(n))

const word: Arbitrary<string> =
  fc.array(fc.oneof(lower, upper)).map((xs) => xs.join(''))

const words: Arbitrary<string> = fc.array(word).map((xs) => xs.join(' '))

const maxWords = (max: number): Arbitrary<string> =>
  fc.integer({ min: 1, max })
    .chain((maxLength) =>
      fc.array(word, { minLength: 1, maxLength }).map((xs) => xs.join(' '))
    )

const natStr: Arbitrary<string> = fc.nat().map((n) => n.toString())

const numStr = (len: number): Arbitrary<string> =>
  fc.array(fc.nat({ max: 9 }), { minLength: len, maxLength: len })
    .map((x) => x.join(''))

const state = fc.constantFrom(...locationPostalCodes.map(([, code]) => code))

const concat = (as: Arbitrary<string>, bs: Arbitrary<string>, sep: string = ' '): Arbitrary<string> =>
  as.chain((a) => bs.map((b) => `${a}${sep}${b}`))

// Ideally these would be normally distributed...
const wages: Arbitrary<number> = fc.nat({ max: 10000000 })
const investment: Arbitrary<number> = fc.nat({ max: 100000 })
const expense: Arbitrary<number> = fc.nat({ max: 10000 })
const daysInYear: Arbitrary<number> = fc.nat({ max: util.daysInYear(CURRENT_YEAR) })
const daysInYearPair: Arbitrary<[number, number]> =
  daysInYear.chain((d) =>
    fc.nat({ max: util.daysInYear(CURRENT_YEAR) - d })
      .map((d2) => [d, d2])
  )
const birthYear: Arbitrary<number> = fc.integer({ min: 1900, max: CURRENT_YEAR })

const payerName: Arbitrary<string> = maxWords(3)

const ein: Arbitrary<string> = numStr(9)
const zip: Arbitrary<string> = fc.oneof(numStr(5), numStr(9))
const routing: Arbitrary<string> = numStr(9)
const account: Arbitrary<string> = fc.integer({ min: 4, max: 17 }).chain((len) => numStr(len))

const email = fc.tuple(word, word, word).map(([w1, w2, w3]) => `${w1}@${w2}.${w3}`)
const phoneNumber = numStr(10)

const address: Arbitrary<types.Address> =
  fc.tuple(concat(natStr, words), natStr, words, state, zip)
    .map(([address, aptNo, city, state, zip]) => ({
      address, aptNo, city, state, zip
    }))

const employer: Arbitrary<types.Employer> =
  fc.tuple(ein, payerName, address)
    .map(([EIN, employerName, address]) => ({
      EIN, employerName, address
    }))

const w2: Arbitrary<types.IncomeW2> =
  fc.tuple(maxWords(2), wages, fc.nat(), fc.nat(), fc.nat(), employer)
    .map(([occupation, income, fedWithholding, ssWithholding, medicareWithholding, employer]) => ({
      occupation, income, fedWithholding, employer, personRole: types.PersonRole.PRIMARY, ssWithholding, medicareWithholding
    }))

export const f1099IntData: Arbitrary<types.F1099IntData> =
  fc.nat().map((income) => ({ income }))

export const f1099DivData: Arbitrary<types.F1099DivData> =
  fc.tuple(investment, investment)
    .map(([dividends, qualifiedDividends]) => ({ dividends, qualifiedDividends }))

export const f1099BData: Arbitrary<types.F1099BData> =
  fc.tuple(investment, investment, investment, investment)
    .map(([shortTermProceeds, shortTermCostBasis, longTermProceeds, longTermCostBasis]) => ({
      shortTermProceeds,
      shortTermCostBasis,
      longTermProceeds,
      longTermCostBasis
    }))

export const f1099Int: Arbitrary<types.Income1099Int> =
  fc.tuple(payerName, f1099IntData)
    .map(([payer, form]) => ({
      type: types.Income1099Type.INT,
      form,
      payer,
      personRole: types.PersonRole.PRIMARY
    }))

export const f1099B: Arbitrary<types.Income1099B> =
  fc.tuple(payerName, f1099BData)
    .map(([payer, form]) => ({
      type: types.Income1099Type.B,
      form,
      payer,
      personRole: types.PersonRole.PRIMARY
    }))

export const f1099Div: Arbitrary<types.Income1099Div> =
  fc.tuple(payerName, f1099DivData)
    .map(([payer, form]) => ({
      type: types.Income1099Type.DIV,
      form,
      payer,
      personRole: types.PersonRole.PRIMARY
    }))

export const f1099: Arbitrary<types.Supported1099> =
  fc.oneof(f1099B, f1099Div, f1099Int)

const propExpenseTypeName: Arbitrary<types.PropertyExpenseTypeName> =
  fc.constantFrom(...util.enumKeys(types.PropertyExpenseType))

const propertyType: Arbitrary<types.PropertyTypeName> =
  fc.constantFrom(...util.enumKeys(types.PropertyType))

const propertyExpenses: Arbitrary<Partial<{ [K in types.PropertyExpenseTypeName]: number }>> =
  fc.set(fc.array(propExpenseTypeName))
    .chain((es) =>
      fc.array(expense, { minLength: es.length, maxLength: es.length })
        .map((nums) => Object.fromEntries(util.zip(es, nums)))
    )

export const property: Arbitrary<types.Property> =
  fc.tuple(address, daysInYearPair, investment, propertyType, words, fc.boolean(), propertyExpenses)
    .map(([address, [rentalDays, personalUseDays], rentReceived, propertyType, otherPropertyType, qualifiedJointVenture, expenses]) => ({
      address, rentalDays, personalUseDays, rentReceived, propertyType, otherPropertyType, qualifiedJointVenture, expenses
    }))

export const accountType: Arbitrary<types.AccountType> =
  fc.constantFrom(types.AccountType.checking, types.AccountType.savings)

export const refund: Arbitrary<types.Refund> =
  fc.tuple(routing, account, accountType)
    .map(([routingNumber, accountNumber, accountType]) => ({
      routingNumber, accountNumber, accountType
    }))

export const filingStatus: Arbitrary<types.FilingStatus> =
  fc.constantFrom(...util.enumKeys(types.FilingStatus).map((x) => types.FilingStatus[x]))

export const person: Arbitrary<types.Person> =
  fc.tuple(word, word, ein)
    .map(([firstName, lastName, ssid]) => ({
      firstName, lastName, ssid, role: types.PersonRole.PRIMARY
    }))

export const primaryPerson: Arbitrary<types.PrimaryPerson> =
  fc.tuple(person, address, fc.boolean())
    .map(([person, address, isTaxpayerDependent]) => ({
      ...person, address, isTaxpayerDependent
    }))

export const spouse: Arbitrary<types.Spouse> =
  fc.tuple(person, fc.boolean())
    .map(([person, isTaxpayerDependent]) => ({
      ...person, isTaxpayerDependent
    }))

const qualifyingInformation: Arbitrary<types.QualifyingInformation> =
  fc.tuple(birthYear, fc.nat({ max: 12 }), fc.boolean())
    .map(([birthYear, numberOfMonths, isStudent]) => ({
      birthYear, numberOfMonths, isStudent
    }))

export const dependent: Arbitrary<types.Dependent> =
  fc.tuple(person, word, qualifyingInformation)
    .map(([person, relationship, qualifyingInfo]) => ({
      ...person, relationship, qualifyingInfo
    }))

export const taxPayer: Arbitrary<types.TaxPayer> =
  fc.tuple(filingStatus, primaryPerson, spouse, fc.array(dependent), email, phoneNumber)
    .map(([filingStatus, primaryPerson, spouse, dependents, contactEmail, contactPhoneNumber]) => ({
      filingStatus, primaryPerson, spouse, dependents, contactEmail, contactPhoneNumber
    }))

export const information: Arbitrary<types.Information> =
  fc.tuple(fc.array(f1099), fc.array(w2), fc.array(property), refund, taxPayer)
    .map(([f1099s, w2s, realEstate, refund, taxPayer]) => ({
      f1099s, w2s, realEstate, refund, taxPayer
    }))

export const taxesState: Arbitrary<types.TaxesState> =
  information.map((information) => ({ information }))

export const f1040: Arbitrary<[F1040, Form[]]> =
  information
    .map((information) => create1040(information))
    .filter((res) => util.isRight(res))
    .map((res) => (res as util.Right<[F1040, Form[]]>).right)
