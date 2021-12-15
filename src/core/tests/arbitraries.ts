import * as fc from 'fast-check'
import { Arbitrary } from 'fast-check'
import locationPostalCodes from '../data/locationPostalCodes'
import { QuestionTagName, questionTagNames, Responses } from '../data'
import * as types from '../data'
import * as util from '../util'
import _ from 'lodash'

const lower: Arbitrary<string> = fc
  .integer({ min: 0x61, max: 0x7a })
  .map((n) => String.fromCharCode(n))

const upper: Arbitrary<string> = fc
  .integer({ min: 0x41, max: 0x5a })
  .map((n) => String.fromCharCode(n))

const word: Arbitrary<string> = fc
  .array(fc.oneof(lower, upper))
  .map((xs) => xs.join(''))

const words: Arbitrary<string> = fc.array(word).map((xs) => xs.join(' '))

const maxWords = (max: number): Arbitrary<string> =>
  fc
    .integer({ min: 1, max })
    .chain((maxLength) =>
      fc.array(word, { minLength: 1, maxLength }).map((xs) => xs.join(' '))
    )

const natStr: Arbitrary<string> = fc.nat().map((n) => n.toString())

const numStr = (len: number): Arbitrary<string> =>
  fc
    .array(fc.nat({ max: 9 }), { minLength: len, maxLength: len })
    .map((x) => x.join(''))

const state = fc.constantFrom(...locationPostalCodes.map(([, code]) => code))

const concat = (
  as: Arbitrary<string>,
  bs: Arbitrary<string>,
  sep = ' '
): Arbitrary<string> => as.chain((a) => bs.map((b) => `${a}${sep}${b}`))

// Ideally these would be normally distributed...
const wages: Arbitrary<number> = fc.nat({ max: 10000000 })
const posCurrency = (max: number): Arbitrary<number> =>
  fc.nat({ max: max * 100 }).map((x) => x / 100)
const posNegCurrency = (max: number): Arbitrary<number> =>
  fc
    .integer({
      min: -max * 100,
      max: max * 100
    })
    .map((x) => x / 100)
const investment = posCurrency(100000)
const investmentResult = posNegCurrency(100000)
const expense: Arbitrary<number> = posCurrency(10000)
const interest: Arbitrary<number> = posCurrency(10000)
const payment: Arbitrary<number> = fc.nat({ max: 100000 })

const payerName: Arbitrary<string> = maxWords(3)

const ein: Arbitrary<string> = numStr(9)
const zip: Arbitrary<string> = fc.oneof(numStr(5), numStr(9))
const routing: Arbitrary<string> = numStr(9)
const account: Arbitrary<string> = fc
  .integer({ min: 4, max: 17 })
  .chain((len) => numStr(len))

const email = fc
  .tuple(word, word, word)
  .map(([w1, w2, w3]) => `${w1}@${w2}.${w3}`)
const phoneNumber = numStr(10)

const address: Arbitrary<types.Address> = fc
  .tuple(concat(natStr, words), natStr, words, state, zip)
  .map(([address, aptNo, city, state, zip]) => ({
    address,
    aptNo,
    city,
    state,
    zip
  }))

const employer: Arbitrary<types.Employer> = fc
  .tuple(ein, payerName, address)
  .map(([EIN, employerName, address]) => ({
    EIN,
    employerName,
    address
  }))

const w2: Arbitrary<types.IncomeW2> = wages.chain((income) =>
  fc
    .tuple(
      maxWords(2),
      fc.nat({ max: income }),
      fc.nat({ max: income }),
      fc.nat({ max: income }),
      fc.nat({ max: income }),
      employer,
      state,
      fc.nat({ max: income }),
      fc.nat({ max: income })
    )
    .map(
      ([
        occupation,
        medicareIncome,
        fedWithholding,
        ssWithholding,
        medicareWithholding,
        employer,
        state,
        stateWages,
        stateWithholding
      ]) => ({
        occupation,
        income,
        medicareIncome,
        fedWithholding,
        employer,
        personRole: types.PersonRole.PRIMARY,
        ssWithholding,
        medicareWithholding,
        state,
        stateWages,
        stateWithholding
      })
    )
)

export const f1099IntData: Arbitrary<types.F1099IntData> = fc
  .nat()
  .map((income) => ({ income }))

export const f1099DivData: Arbitrary<types.F1099DivData> = interest.chain(
  (dividends) =>
    fc
      .nat({ max: dividends * 100 })
      .map((qdiv) => ({ dividends, qualifiedDividends: qdiv / 100 }))
)

export const f1099BData: Arbitrary<types.F1099BData> = fc
  .tuple(investmentResult, investment, investmentResult, investment)
  .map(
    ([
      shortTermProceeds,
      shortTermCostBasis,
      longTermProceeds,
      longTermCostBasis
    ]) => ({
      shortTermProceeds,
      shortTermCostBasis,
      longTermProceeds,
      longTermCostBasis
    })
  )

export const f1099Int: Arbitrary<types.Income1099Int> = fc
  .tuple(payerName, f1099IntData)
  .map(([payer, form]) => ({
    type: types.Income1099Type.INT,
    form,
    payer,
    personRole: types.PersonRole.PRIMARY
  }))

export const f1099B: Arbitrary<types.Income1099B> = fc
  .tuple(payerName, f1099BData)
  .map(([payer, form]) => ({
    type: types.Income1099Type.B,
    form,
    payer,
    personRole: types.PersonRole.PRIMARY
  }))

export const f1099Div: Arbitrary<types.Income1099Div> = fc
  .tuple(payerName, f1099DivData)
  .map(([payer, form]) => ({
    type: types.Income1099Type.DIV,
    form,
    payer,
    personRole: types.PersonRole.PRIMARY
  }))

export const f1099: Arbitrary<types.Supported1099> = fc.oneof(
  f1099B,
  f1099Div,
  f1099Int
)

const propExpenseTypeName: Arbitrary<types.PropertyExpenseTypeName> =
  fc.constantFrom(...util.enumKeys(types.PropertyExpenseType))

const propertyType: Arbitrary<types.PropertyTypeName> = fc.constantFrom(
  ...util.enumKeys(types.PropertyType)
)

const propertyExpenses: Arbitrary<
  Partial<{ [K in types.PropertyExpenseTypeName]: number }>
> = fc.set(propExpenseTypeName).chain((es) =>
  fc
    .array(expense, { minLength: es.length, maxLength: es.length })
    .map((nums) =>
      _.chain(es)
        .zipWith(nums, (e, num) => [e, num])
        .fromPairs()
        .value()
    )
)

const f1098e: Arbitrary<types.F1098e> = fc
  .tuple(maxWords(2), interest)
  .map(([lender, interest]) => ({
    lender,
    interest
  }))

const estTax: Arbitrary<types.EstimatedTaxPayments> = fc
  .tuple(maxWords(5), payment)
  .map(([label, payment]) => ({
    label,
    payment
  }))

export const accountType: Arbitrary<types.AccountType> = fc.constantFrom(
  types.AccountType.checking,
  types.AccountType.savings
)

export const refund: Arbitrary<types.Refund> = fc
  .tuple(routing, account, accountType)
  .map(([routingNumber, accountNumber, accountType]) => ({
    routingNumber,
    accountNumber,
    accountType
  }))

export const filingStatus: Arbitrary<types.FilingStatus> = fc.constantFrom(
  ...util.enumKeys(types.FilingStatus).map((x) => types.FilingStatus[x])
)

export const person: Arbitrary<types.Person> = fc
  .tuple(word, word, ein)
  .map(([firstName, lastName, ssid]) => ({
    firstName,
    lastName,
    ssid,
    role: types.PersonRole.PRIMARY
  }))

export const primaryPerson: Arbitrary<types.PrimaryPerson> = fc
  .tuple(person, address, fc.boolean())
  .map(([person, address, isTaxpayerDependent]) => ({
    ...person,
    address,
    isTaxpayerDependent
  }))

export const spouse: Arbitrary<types.Spouse> = fc
  .tuple(person, fc.boolean())
  .map(([person, isTaxpayerDependent]) => ({
    ...person,
    isTaxpayerDependent
  }))

const questionTag: Arbitrary<QuestionTagName> = fc.constantFrom(
  ...questionTagNames
)

// make sure that the question tag maps to values of correct type.
const questionTagArbs = {
  CRYPTO: fc.boolean(),
  FOREIGN_ACCOUNT_EXISTS: fc.boolean(),
  FINCEN_114: fc.boolean(),
  FINCEN_114_ACCOUNT_COUNTRY: words,
  FOREIGN_TRUST_RELATIONSHIP: fc.boolean(),
  LIVE_APART_FROM_SPOUSE: fc.boolean()
}

export const questions: Arbitrary<Responses> = fc
  .set(questionTag)
  .chain((tags) =>
    fc
      .tuple(...tags.map((t) => questionTagArbs[t].map((v) => [t, v])))
      .map((kvs) => Object.fromEntries(kvs))
  )

export class Arbitraries {
  currentYear: number

  constructor(currentYear: number) {
    this.currentYear = currentYear
  }

  daysInYear = (): Arbitrary<number> =>
    fc.nat({
      max: util.daysInYear(this.currentYear)
    })

  daysInYearPair = (): Arbitrary<[number, number]> =>
    this.daysInYear().chain((d) =>
      fc
        .nat({ max: util.daysInYear(this.currentYear) - d })
        .map((d2) => [d, d2])
    )

  birthYear = (): Arbitrary<number> =>
    fc.integer({
      min: 1900,
      max: this.currentYear
    })

  property = (): Arbitrary<types.Property> =>
    fc
      .tuple(
        address,
        this.daysInYearPair(),
        investment,
        propertyType,
        words,
        fc.boolean(),
        propertyExpenses
      )
      .map(
        ([
          address,
          [rentalDays, personalUseDays],
          rentReceived,
          propertyType,
          otherPropertyType,
          qualifiedJointVenture,
          expenses
        ]) => ({
          address,
          rentalDays,
          personalUseDays,
          rentReceived,
          propertyType,
          otherPropertyType,
          qualifiedJointVenture,
          expenses
        })
      )

  qualifyingInformation = (): Arbitrary<types.QualifyingInformation> =>
    fc
      .tuple(this.birthYear(), fc.nat({ max: 12 }), fc.boolean())
      .map(([birthYear, numberOfMonths, isStudent]) => ({
        birthYear,
        numberOfMonths,
        isStudent
      }))

  dependent = (): Arbitrary<types.Dependent> =>
    fc
      .tuple(person, word, this.qualifyingInformation())
      .map(([person, relationship, qualifyingInfo]) => ({
        ...person,
        relationship,
        qualifyingInfo
      }))

  taxPayer = (): Arbitrary<types.TaxPayer> =>
    fc
      .tuple(
        filingStatus,
        primaryPerson,
        spouse,
        fc.array(this.dependent()),
        email,
        phoneNumber
      )
      .map(
        ([
          filingStatus,
          primaryPerson,
          spouse,
          dependents,
          contactEmail,
          contactPhoneNumber
        ]) => ({
          filingStatus,
          primaryPerson,
          spouse,
          dependents,
          contactEmail,
          contactPhoneNumber
        })
      )

  information = (): Arbitrary<types.Information> =>
    fc
      .tuple(
        fc.array(f1099),
        fc.array(w2),
        fc.array(this.property()),
        fc.array(estTax),
        fc.array(f1098e),
        refund,
        this.taxPayer(),
        questions,
        state
      )
      .map(
        ([
          f1099s,
          w2s,
          realEstate,
          estimatedTaxes,
          f1098es,
          refund,
          taxPayer,
          questions,
          state
        ]) => ({
          f1099s,
          w2s,
          realEstate,
          estimatedTaxes,
          f1098es,
          refund,
          taxPayer,
          questions,
          stateResidencies: [{ state }]
        })
      )
}

export const forYear = (year: number): Arbitraries => new Arbitraries(year)
