import Form from '../Form'
import F1040 from '../../irsForms/F1040'
import { Field } from '../../pdfFiller'
import { Information, State } from '../../redux/data'
import {
  computeField,
  displayNumber,
  positiveOnly,
  sumFields
} from 'ustaxes/irsForms/util'
import parameters from './Parameters'

export class Pa40 implements Form {
  info: Information
  f1040: F1040
  formName = 'pa-40'
  state: State = 'PA'
  formOrder = 0

  constructor(info: Information, f1040: F1040) {
    this.info = info
    this.f1040 = f1040
  }

  attachments = (): Form[] => []

  /**
   * Index 0: Enter SSN of spouse without dashes or spaces
   */
  enterSSNOfSpouseWithoutDashesOrSpaces = (): string | undefined =>
    this.info.taxPayer?.spouse?.ssid

  f0 = (): string | undefined => this.enterSSNOfSpouseWithoutDashesOrSpaces()

  /**
   * Index 1: Use all caps to enter taxpayer's last name
   */
  useAllCapsToEnterTaxpayersLastName = (): string | undefined =>
    this.info.taxPayer?.primaryPerson?.lastName.toUpperCase()

  f1 = (): string | undefined => this.useAllCapsToEnterTaxpayersLastName()

  /**
   * Index 2: Use all caps to enter suffixes such as JR, SR, III
   */
  useAllCapsToEnterSuffixesSuchAsJRSRIII = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.useAllCapsToEnterSuffixesSuchAsJRSRIII()

  /**
   * Index 3: Use all caps to enter taxpayer's first name
   */
  useAllCapsToEnterTaxpayersFirstName = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.lastName.toUpperCase()

  f3 = (): string | undefined => this.useAllCapsToEnterTaxpayersFirstName()

  /**
   * Index 4: Use all caps to enter spouse's first name
   */
  useAllCapsToEnterSpousesFirstName = (): string | undefined =>
    this.info.taxPayer.spouse?.firstName.toUpperCase()

  f4 = (): string | undefined => this.useAllCapsToEnterSpousesFirstName()

  /**
   * Index 5: Use all caps to enter spouse's last name if different from above
   */
  useAllCapsToEnterSpousesLastNameIfDifferentFromAbove = ():
    | string
    | undefined => {
    if (
      this.info.taxPayer.spouse?.lastName !==
      this.info.taxPayer.primaryPerson?.lastName
    ) {
      return this.info.taxPayer.spouse?.lastName.toUpperCase()
    }
  }

  f5 = (): string | undefined =>
    this.useAllCapsToEnterSpousesLastNameIfDifferentFromAbove()

  /**
   * Index 6: Use all caps to enter spouse's suffixes such as JR, SR, III
   */
  useAllCapsToEnterSpousesSuffixesSuchAsJRSRIII = (): string | undefined => {
    return undefined
  }

  f6 = (): string | undefined =>
    this.useAllCapsToEnterSpousesSuffixesSuchAsJRSRIII()

  /**
   * Index 7: Use all caps to enter First Line of Address
   */
  useAllCapsToEnterFirstLineOfAddress = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.address.toUpperCase()

  f7 = (): string | undefined => this.useAllCapsToEnterFirstLineOfAddress()

  /**
   * Index 8: Use all caps to enter Second Line of Address
   */
  useAllCapsToEnterSecondLineOfAddress = (): string | undefined => {
    if (this.info.taxPayer.primaryPerson?.address.aptNo !== undefined) {
      return `UNIT ${this.info.taxPayer.primaryPerson.address.aptNo.toUpperCase()}`
    }
  }

  f8 = (): string | undefined => this.useAllCapsToEnterSecondLineOfAddress()

  /**
   * Index 9: Use all caps to enter City or Post Office
   */
  useAllCapsToEnterCityOrPostOffice = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.city.toUpperCase()

  f9 = (): string | undefined => this.useAllCapsToEnterCityOrPostOffice()

  /**
   * Index 10: Enter five digit Zip Code
   */
  enterFiveDigitZipCode = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.zip?.substr(0, 5)

  f10 = (): string | undefined => this.enterFiveDigitZipCode()

  /**
   * Index 11: Enter Daytime Telephone Number without parenthesis, dashes or spaces
   */
  enterDaytimeTelephoneNumberWithoutParenthesisDashesOrSpaces = ():
    | string
    | undefined => {
    return this.info.taxPayer.contactPhoneNumber
  }

  f11 = (): string | undefined =>
    this.enterDaytimeTelephoneNumberWithoutParenthesisDashesOrSpaces()

  /**
   * TODO
   * Index 12: Enter five digit School Code from list on pags 42 & 43
   */
  enterFiveDigitSchoolCodeFromListOnPags4243 = (): string => {
    return ''
  }

  f12 = (): string => this.enterFiveDigitSchoolCodeFromListOnPags4243()

  /**
   * TODO
   * Index 13: Extension
   */
  extension = (): boolean | undefined => {
    return undefined
  }

  f13 = (): boolean | undefined => this.extension()

  /**
   * TODO
   * Index 14: Amended Return
   */
  amendedReturn = (): boolean | undefined => {
    return undefined
  }

  f14 = (): boolean | undefined => this.amendedReturn()

  /**
   * TODO
   * Index 15: Residency Status
   */
  residencyStatus = (): boolean | undefined => {
    return undefined
  }

  f15 = (): boolean | undefined => this.residencyStatus()

  /**
   * PART YEAR RESIDENT, not implemented
   * Index 16: Part Year Resident from
   */
  partYearResidentFrom = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.partYearResidentFrom()

  /**
   * Index 17: Part year resident to
   */
  partYearResidentTo = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.partYearResidentTo()

  /**
   * Index 18: Filing Status
   */
  filingStatus = (): boolean | undefined => {
    return undefined
  }

  f18 = (): boolean | undefined => this.filingStatus()

  /**
   * Index 19: Final Return
   */
  finalReturn = (): string | undefined => {
    return undefined
  }

  f19 = (): string | undefined => this.finalReturn()

  /**
   * Index 20: Farmers
   */
  farmers = (): boolean | undefined => {
    return undefined
  }

  f20 = (): boolean | undefined => this.farmers()

  /**
   * Index 21: Name of School District
   */
  nameOfSchoolDistrict = (): string => {
    return ''
  }

  f21 = (): string => this.nameOfSchoolDistrict()

  /**
   * Index 22: Your Occupation
   */
  yourOccupation = (): string => {
    return ''
  }

  f22 = (): string => this.yourOccupation()

  /**
   * Index 23: Spouse's occupation
   */
  spousesOccupation = (): string => {
    return ''
  }

  f23 = (): string => this.spousesOccupation()

  /**
   * Index 24: 1a. Gross Compensation
   */
  l1aGrossCompensation = (): number | undefined => this.f1040.l1()

  f24 = (): number | undefined => displayNumber(this.l1aGrossCompensation())

  /**
   * TODO
   * Index 25: 1b. Unreimbursed Employee Business Expenses
   */
  l1bUnreimbursedEmployeeBusinessExpenses = (): number | undefined => {
    return undefined
  }

  f25 = (): number | undefined =>
    displayNumber(this.l1bUnreimbursedEmployeeBusinessExpenses())

  /**
   * Index 26: 1c. Net Compensation
   */
  l1cNetCompensation = (): number | undefined =>
    displayNumber(
      computeField(this.l1aGrossCompensation()) -
        computeField(this.l1bUnreimbursedEmployeeBusinessExpenses())
    )

  f26 = (): number | undefined => displayNumber(this.l1cNetCompensation())

  /**
   * Index 27: 2. Interest Income
   * Attach PA Schedule A
   */
  l2InterestIncome = (): number | undefined => this.f1040.l2b()

  f27 = (): number | undefined => displayNumber(this.l2InterestIncome())

  /**
   * Index 28: 3. Dividend  and Capital Gains Distributions Income
   * Attach Schedule B
   */
  l3DividendAndCapitalGainsDistributionsIncome = (): number | undefined =>
    this.f1040.l7()

  f28 = (): number | undefined =>
    displayNumber(this.l3DividendAndCapitalGainsDistributionsIncome())

  /**
   * Index 29: 4. Loss
   */
  l4Loss = (): boolean =>
    (this.l4NetIncomeOrLossFromTheOperationOfABusinessEtc() ?? 0) < 0

  f29 = (): boolean | undefined => this.l4Loss()

  /**
   * Index 30: 4. Net Income or Loss from the Operation of a Business, etc
   */
  l4NetIncomeOrLossFromTheOperationOfABusinessEtc = (): number | undefined => {
    return undefined
  }

  f30 = (): number | undefined =>
    displayNumber(this.l4NetIncomeOrLossFromTheOperationOfABusinessEtc())

  /**
   * Index 31: 5. Loss
   */
  l5Loss = (): boolean => (this.l5NetGainOrLossFromSaleEtcOfProperty() ?? 0) < 0

  f31 = (): boolean | undefined => this.l5Loss()

  /**
   * Index 32: 5. Net Gain or Loss from Sale, etc. of Property
   */
  l5NetGainOrLossFromSaleEtcOfProperty = (): number | undefined =>
    this.f1040.scheduleE?.l26()

  f32 = (): number | undefined =>
    displayNumber(this.l5NetGainOrLossFromSaleEtcOfProperty())

  /**
   * Index 33: 6. Loss
   */
  l6Loss = (): boolean => (this.l6NetIncomeOrLossFromRentsEtc() ?? 0) < 0

  f33 = (): boolean | undefined => this.l6Loss()

  /**
   * Index 34: 6. Net Income or Loss from Rents, etc
   */
  l6NetIncomeOrLossFromRentsEtc = (): number | undefined => {
    return undefined
  }

  f34 = (): number | undefined =>
    displayNumber(this.l6NetIncomeOrLossFromRentsEtc())

  /**
   * Index 35: 7. Estate or Trust income
   * TODO
   * Attach schedule J
   */
  l7EstateOrTrustIncome = (): number | undefined => undefined

  f35 = (): number | undefined => displayNumber(this.l7EstateOrTrustIncome())

  /**
   * Index 36: 8. Gambling and Lottery Winnings
   * TODO
   * Attach schedule T
   */
  l8GamblingAndLotteryWinnings = (): number | undefined => undefined

  f36 = (): number | undefined =>
    displayNumber(this.l8GamblingAndLotteryWinnings())

  /**
   * Index 37: 9. Total PA Taxable Income
   */
  l9TotalPATaxableIncome = (): number | undefined =>
    sumFields([
      this.l1cNetCompensation(),
      this.l2InterestIncome(),
      this.l3DividendAndCapitalGainsDistributionsIncome(),
      positiveOnly(this.l4NetIncomeOrLossFromTheOperationOfABusinessEtc()),
      positiveOnly(this.l5NetGainOrLossFromSaleEtcOfProperty()),
      positiveOnly(this.l6NetIncomeOrLossFromRentsEtc()),
      this.l7EstateOrTrustIncome(),
      this.l8GamblingAndLotteryWinnings()
    ])

  f37 = (): number | undefined => displayNumber(this.l9TotalPATaxableIncome())

  /**
   * Index 38: Code
   * Line 10 other deductions, enter the appropriate code for the type of deduction
   */
  code = (): string => {
    return ''
  }

  f38 = (): string => this.code()

  /**
   * Index 39: 10.  Other Deductions
   * TODO
   */
  l10OtherDeductions = (): number | undefined => {
    return undefined
  }

  f39 = (): number | undefined => displayNumber(this.l10OtherDeductions())

  /**
   * Index 40: 11. Adjusted PA Taxable Income
   */
  l11AdjustedPATaxableIncome = (): number | undefined => {
    return sumFields([
      this.l9TotalPATaxableIncome(),
      -computeField(this.l10OtherDeductions())
    ])
  }

  f40 = (): number | undefined =>
    displayNumber(this.l11AdjustedPATaxableIncome())

  /**
   * Index 41: Official Use Only
   */
  officialUseOnly = (): string | undefined => {
    return undefined
  }

  f41 = (): string | undefined => this.officialUseOnly()

  /**
   * Index 42: start box
   */
  startBox = (): string | undefined => {
    return undefined
  }

  f42 = (): string | undefined => this.startBox()

  /**
   * Index 43: arrow
   */
  arrow = (): string | undefined => {
    return undefined
  }

  f43 = (): string | undefined => this.arrow()

  /**
   * Index 44: Enter SSN shown first without dashes or spaces
   */
  enterSSNShownFirstWithoutDashesOrSpaces = (): string | undefined => {
    return this.info.taxPayer.primaryPerson?.ssid
  }

  f44 = (): string | undefined => this.enterSSNShownFirstWithoutDashesOrSpaces()

  /**
   * Index 45: Name(s)
   */
  names = (): string => {
    return ''
  }

  f45 = (): string => this.names()

  /**
   * Index 46: 12. PA Tax Liability. Multiply Line 11 by tax rate
   */
  l12PATaxLiability = (): number | undefined => {
    return computeField(
      computeField(this.l11AdjustedPATaxableIncome()) * parameters.stateTaxRate
    )
  }

  f46 = (): number | undefined => displayNumber(this.l12PATaxLiability())

  /**
   * Index 47: 13. Total PA Tax Withheld
   */
  l13TotalPATaxWithheld = (): number | undefined => {
    return undefined
  }

  f47 = (): number | undefined => displayNumber(this.l13TotalPATaxWithheld())

  /**
   * Index 48: 14. Credit from your PA Income Tax Return
   * TODO
   */
  l14CreditFromYourPAIncomeTaxReturn = (): number | undefined => {
    return undefined
  }

  f48 = (): number | undefined =>
    displayNumber(this.l14CreditFromYourPAIncomeTaxReturn())

  /**
   * Index 49: 15. Estimated Installment Payments
   * TODO
   */
  l15EstimatedInstallmentPayments = (): number | undefined => {
    return undefined
  }

  f49 = (): number | undefined =>
    displayNumber(this.l15EstimatedInstallmentPayments())

  /**
   * Index 50: 16. Extension Payment
   * TODO
   */
  l16ExtensionPayment = (): number | undefined => {
    return undefined
  }

  f50 = (): number | undefined => displayNumber(this.l16ExtensionPayment())

  /**
   * Index 51: 17. Nonredsident Tax Withheld
   * TODO
   */
  l17NonredsidentTaxWithheld = (): number | undefined => {
    return undefined
  }

  f51 = (): number | undefined =>
    displayNumber(this.l17NonredsidentTaxWithheld())

  /**
   * Index 52: 18.Total Estimated Payments and Credits
   */
  l18TotalEstimatedPaymentsAndCredits = (): number | undefined =>
    sumFields([
      this.l14CreditFromYourPAIncomeTaxReturn(),
      this.l15EstimatedInstallmentPayments(),
      this.l16ExtensionPayment(),
      this.l17NonredsidentTaxWithheld()
    ])

  f52 = (): number | undefined =>
    displayNumber(this.l18TotalEstimatedPaymentsAndCredits())

  /**
   * Index 53: Tax Forgiveness
   * TODO - Schedule SP
   */
  taxForgiveness = (): boolean | undefined => {
    return undefined
  }

  f53 = (): boolean | undefined => this.taxForgiveness()

  /**
   * Index 54: Dependents
   * TODO - Schedule SP
   */
  dependents = (): string | undefined => {
    return undefined
  }

  f54 = (): string | undefined => this.dependents()

  /**
   * Index 55: 20. Total Eligibility Income
   * Section III, line 11, PA Schedule SP
   */
  l20TotalEligibilityIncome = (): number | undefined => {
    return undefined
  }

  f55 = (): number | undefined =>
    displayNumber(this.l20TotalEligibilityIncome())

  /**
   * Index 56: 21. Tax Forgiveness Credit
   * TODO
   * From section IV, Line 16, PA Schedule SP
   */
  l21TaxForgivenessCredit = (): number | undefined => {
    return undefined
  }

  f56 = (): number | undefined => displayNumber(this.l21TaxForgivenessCredit())

  /**
   * Index 57: 22. Resident Credit
   * PA Schedule G-L and/or RK-1
   */
  l22ResidentCredit = (): number | undefined => {
    return undefined
  }

  f57 = (): number | undefined => displayNumber(this.l22ResidentCredit())

  /**
   * Index 58: 23.Total Other Credits
   * PA Schedule OC
   */
  l23TotalOtherCredits = (): number | undefined => undefined

  f58 = (): number | undefined => displayNumber(this.l23TotalOtherCredits())

  /**
   * Index 59: 24. Total Payments and Credits
   */
  l24TotalPaymentsAndCredits = (): number | undefined =>
    sumFields([
      this.l13TotalPATaxWithheld(),
      this.l18TotalEstimatedPaymentsAndCredits(),
      this.l21TaxForgivenessCredit(),
      this.l22ResidentCredit(),
      this.l23TotalOtherCredits()
    ])

  f59 = (): number | undefined =>
    displayNumber(this.l24TotalPaymentsAndCredits())

  /**
   * Index 60: 27. REV-1630
   * TODO
   * True if including Rev-1630, Rev 1630-A
   */
  l27REV1630 = (): boolean | undefined => {
    return undefined
  }

  f60 = (): boolean | undefined => this.l27REV1630()

  /**
   * Index 61: 27.Penalties and Interest
   * TODO
   */
  l27PenaltiesAndInterest = (): number | undefined => {
    return undefined
  }

  f61 = (): number | undefined => displayNumber(this.l27PenaltiesAndInterest())

  /**
   * Index 62: 27. Code
   */
  l27Code = (): string => {
    return ''
  }

  f62 = (): string => this.l27Code()

  /**
   * Index 63: 28. TOTAL PAYMENT DUE
   */
  l28TOTALPAYMENT = (): number | undefined =>
    sumFields([this.l26TAXDUE(), this.l27PenaltiesAndInterest()])

  f63 = (): number | undefined => displayNumber(this.l28TOTALPAYMENT())

  /**
   * Index 64: 29. OVERPAYMENT
   */
  l29OVERPAYMENT = (): number | undefined =>
    positiveOnly(
      computeField(this.l24TotalPaymentsAndCredits()) -
        computeField(
          sumFields([
            this.l12PATaxLiability(),
            this.l25USETAX(),
            this.l27PenaltiesAndInterest()
          ])
        )
    )

  f64 = (): number | undefined => displayNumber(this.l29OVERPAYMENT())

  /**
   * Index 65: 30. Refund
   * TODO - not supporting PA return's donations
   */
  l30Refund = (): number | undefined => this.l29OVERPAYMENT()

  f65 = (): number | undefined => displayNumber(this.l30Refund())

  /**
   * Index 66: 31. Credit
   * TODO - assuming user wants a refund.
   */
  l31Credit = (): number | undefined => {
    return undefined
  }

  f66 = (): number | undefined => displayNumber(this.l31Credit())

  /**
   * Index 67: Signature
   */
  signature = (): string | undefined => {
    return undefined
  }

  f67 = (): string | undefined => this.signature()

  /**
   * Index 68: Date
   */
  date = (): string => {
    return ''
  }

  f68 = (): string => this.date()

  /**
   * Index 69: E-File Opt Out
   */
  eFileOptOut = (): boolean | undefined => {
    return undefined
  }

  f69 = (): boolean | undefined => this.eFileOptOut()

  /**
   * Index 70: Preparerês SSN / PTIN
   */
  preparersSSNPTIN = (): string | undefined => {
    return undefined
  }

  f70 = (): string | undefined => this.preparersSSNPTIN()

  /**
   * Index 71: Spouse's Signature
   */
  spousesSignature = (): string | undefined => {
    return undefined
  }

  f71 = (): string | undefined => this.spousesSignature()

  /**
   * Index 72: Preparer's Name
   */
  preparersName = (): string | undefined => {
    return undefined
  }

  f72 = (): string | undefined => this.preparersName()

  /**
   * Index 73: Preparer's Telephone Number
   */
  preparersTelephoneNumber = (): string | undefined => {
    return undefined
  }

  f73 = (): string | undefined => this.preparersTelephoneNumber()

  /**
   * Index 74: Firm FEIN
   */
  firmFEIN = (): string | undefined => {
    return undefined
  }

  f74 = (): string | undefined => this.firmFEIN()

  /**
   * Index 75: Form REV-459B
   */
  formREV459B = (): boolean | undefined => {
    return undefined
  }

  f75 = (): boolean | undefined => this.formREV459B()

  /**
   * Index 76: 26. TAX DUE
   */
  l26TAXDUE = (): number | undefined => {
    return positiveOnly(
      computeField(this.l24TotalPaymentsAndCredits()) -
        sumFields([this.l12PATaxLiability(), this.l25USETAX()])
    )
  }

  f76 = (): number | undefined => this.l26TAXDUE()

  /**
   * Index 77: 25. USE TAX
   * TODO
   * Due on internet, mail order or out of state purchases, see the instructions
   */
  l25USETAX = (): number | undefined => undefined

  f77 = (): number | undefined => displayNumber(this.l25USETAX())

  /**
   * Index 78: Taxpayer
   * TODO - what is this?
   */
  taxpayer = (): boolean | undefined => undefined

  f78 = (): boolean | undefined => this.taxpayer()

  /**
   * Index 79: Spouse
   * TODO
   */
  spouse = (): boolean | undefined => {
    return undefined
  }

  f79 = (): boolean | undefined => this.spouse()

  /**
   * Index 80: Taxpayer Date of Death
   * TODO
   */
  taxpayerDateOfDeath = (): string | undefined => {
    return undefined
  }

  f80 = (): string | undefined => this.taxpayerDateOfDeath()

  /**
   * Index 81: Spouse Date of Death
   */
  spouseDateOfDeath = (): string | undefined => {
    return undefined
  }

  f81 = (): string | undefined => this.spouseDateOfDeath()

  /**
   * Index 82: 32. Refund
   */
  l32Refund = (): string | undefined => {
    return undefined
  }

  f82 = (): string | undefined => this.l32Refund()

  /**
   * Index 83: 32. Refund donation line
   */
  l32RefundDonationLine = (): string | undefined => {
    return undefined
  }

  f83 = (): string | undefined => this.l32RefundDonationLine()

  /**
   * Index 84: 33. Refund
   */
  l33Refund = (): string | undefined => {
    return undefined
  }

  f84 = (): string | undefined => this.l33Refund()

  /**
   * Index 85: 33. Refund donation line
   */
  l33RefundDonationLine = (): string | undefined => {
    return undefined
  }

  f85 = (): string | undefined => this.l33RefundDonationLine()

  /**
   * Index 86: 34. Refund
   */
  l34Refund = (): string | undefined => {
    return undefined
  }

  f86 = (): string | undefined => this.l34Refund()

  /**
   * Index 87: 34. Refund donation line
   */
  l34RefundDonationLine = (): string | undefined => {
    return undefined
  }

  f87 = (): string | undefined => this.l34RefundDonationLine()

  /**
   * Index 88: 35. Refund
   */
  l35Refund = (): string | undefined => {
    return undefined
  }

  f88 = (): string | undefined => this.l35Refund()

  /**
   * Index 89: 35. Refund donation line
   */
  l35RefundDonationLine = (): string | undefined => {
    return undefined
  }

  f89 = (): string | undefined => this.l35RefundDonationLine()

  /**
   * Index 90: 36. Refund
   */
  l36Refund = (): string | undefined => {
    return undefined
  }

  f90 = (): string | undefined => this.l36Refund()

  /**
   * Index 91: 36. Refund donation line
   */
  l36RefundDonationLine = (): string | undefined => {
    return undefined
  }

  f91 = (): string | undefined => this.l36RefundDonationLine()

  /**
   * Index 92: Use Cap For Your Middle Initial
   */
  useCapForYourMiddleInitial = (): string | undefined => {
    return undefined
  }

  f92 = (): string | undefined => this.useCapForYourMiddleInitial()

  /**
   * Index 93: Use Cap For Your Spouse's Middle Initial
   */
  useCapForYourSpousesMiddleInitial = (): string | undefined => {
    return undefined
  }

  f93 = (): string | undefined => this.useCapForYourSpousesMiddleInitial()

  /**
   * Index 94: Do Not Call
   */
  doNotCall = (): string | undefined => {
    return undefined
  }

  f94 = (): string | undefined => this.doNotCall()

  /**
   * Index 95: GO TO NEXT PAGE
   */
  gOTONEXTPAGE = (): string | undefined => {
    return undefined
  }

  f95 = (): string | undefined => this.gOTONEXTPAGE()

  /**
   * Index 96: TOP OF PAGE
   */
  tOPOFPAGE = (): string | undefined => {
    return undefined
  }

  f96 = (): string | undefined => this.tOPOFPAGE()

  /**
   * Index 97: Print Form
   */
  printForm = (): string | undefined => {
    return undefined
  }

  f97 = (): string | undefined => this.printForm()

  /**
   * Index 98: RETURN TO PAGE 1
   */
  rETURNTOPAGE1 = (): string | undefined => {
    return undefined
  }

  f98 = (): string | undefined => this.rETURNTOPAGE1()

  /**
   * Index 99: RESET FORM
   */
  rESETFORM = (): string | undefined => {
    return undefined
  }

  f99 = (): string | undefined => this.rESETFORM()

  /**
   * Index 100: Deceased
   */
  deceased = (): boolean | undefined => {
    return undefined
  }

  f100 = (): boolean | undefined => this.deceased()

  /**
   * Index 101: Example Date
   */
  exampleDate = (): string | undefined => {
    return undefined
  }

  f101 = (): string | undefined => this.exampleDate()

  /**
   * Index 102: Use all caps to enter two digit State abbreviation
   */
  useAllCapsToEnterTwoDigitStateAbbreviation = (): string => {
    return ''
  }

  f102 = (): string => this.useAllCapsToEnterTwoDigitStateAbbreviation()

  /**
   * Index 103: Use all caps to enter three digit Country Code
   */
  useAllCapsToEnterThreeDigitCountryCode = (): string => {
    return ''
  }

  f103 = (): string => this.useAllCapsToEnterThreeDigitCountryCode()

  /**
   * Index 104: Disclaimer Notice
   */
  disclaimerNotice = (): string | undefined => {
    return undefined
  }

  f104 = (): string | undefined => this.disclaimerNotice()

  fields = (): Field[] => [
    this.f0(),
    this.f1(),
    this.f2(),
    this.f3(),
    this.f4(),
    this.f5(),
    this.f6(),
    this.f7(),
    this.f8(),
    this.f9(),
    this.f10(),
    this.f11(),
    this.f12(),
    this.f13(),
    this.f14(),
    this.f15(),
    this.f16(),
    this.f17(),
    this.f18(),
    this.f19(),
    this.f20(),
    this.f21(),
    this.f22(),
    this.f23(),
    this.f24(),
    this.f25(),
    this.f26(),
    this.f27(),
    this.f28(),
    this.f29(),
    this.f30(),
    this.f31(),
    this.f32(),
    this.f33(),
    this.f34(),
    this.f35(),
    this.f36(),
    this.f37(),
    this.f38(),
    this.f39(),
    this.f40(),
    this.f41(),
    this.f42(),
    this.f43(),
    this.f44(),
    this.f45(),
    this.f46(),
    this.f47(),
    this.f48(),
    this.f49(),
    this.f50(),
    this.f51(),
    this.f52(),
    this.f53(),
    this.f54(),
    this.f55(),
    this.f56(),
    this.f57(),
    this.f58(),
    this.f59(),
    this.f60(),
    this.f61(),
    this.f62(),
    this.f63(),
    this.f64(),
    this.f65(),
    this.f66(),
    this.f67(),
    this.f68(),
    this.f69(),
    this.f70(),
    this.f71(),
    this.f72(),
    this.f73(),
    this.f74(),
    this.f75(),
    this.f76(),
    this.f77(),
    this.f78(),
    this.f79(),
    this.f80(),
    this.f81(),
    this.f82(),
    this.f83(),
    this.f84(),
    this.f85(),
    this.f86(),
    this.f87(),
    this.f88(),
    this.f89(),
    this.f90(),
    this.f91(),
    this.f92(),
    this.f93(),
    this.f94(),
    this.f95(),
    this.f96(),
    this.f97(),
    this.f98(),
    this.f99(),
    this.f100(),
    this.f101(),
    this.f102(),
    this.f103(),
    this.f104()
  ]
}

const pa40 = (info: Information, f1040: F1040): Pa40 => new Pa40(info, f1040)

export default pa40
