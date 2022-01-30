import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import { sumFields } from 'ustaxes/core/irsForms/util'
import {
  AccountType,
  FilingStatus,
  Information,
  State
} from 'ustaxes/core/data'
import parameters from './Parameters'
import { ORWFHDC } from './ORWFHDC'
import OR40V from './OR40V'

export class OR40 extends Form {
  info: Information
  f1040: F1040
  formName: string
  state: State
  scheduleWFHDC: ORWFHDC
  or40V: OR40V
  formOrder = 0
  methods: FormMethods

  constructor(info: Information, f1040: F1040) {
    super()
    this.info = info
    this.f1040 = f1040
    this.formName = 'OR-40'
    this.state = 'OR'
    this.scheduleWFHDC = new ORWFHDC(info, f1040)
    this.or40V = new OR40V(info, f1040, this)
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => {
    // const pmt = this.payment()
    const result: Form[] = []
    // if ((pmt ?? 0) > 0) {
    //   result.push(this.il1040V)
    // }
    // if (this.scheduleEIC.isRequired()) {
    //   result.push(this.scheduleEIC)
    // }
    // if (this.methods.stateWithholding() > 0) {
    //   const ilwit = new ILWIT(this.info, this.f1040)
    //   result.push(ilwit)
    //   ilwit.attachments().forEach((f) => result.push(f))
    // }

    return result
  }

  /**
   * Index 0: Button - Clear form
   */
  ButtonClearform = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.ButtonClearform()

  /**
   * Index 1: Fiscal Year Ending Date
   */
  FiscalYearEndingDate = (): string | undefined => {
    // format: 'xx xx xxxx'
    return undefined
  }

  f1 = (): string | undefined => this.FiscalYearEndingDate()

  /**
   * Index 2: or-40-p1-2
   */
  or40p12 = (): boolean | undefined => {
    return true
  }

  f2 = (): boolean | undefined => this.or40p12()

  /**
   * Index 3: or-40-p1-4
   */
  or40p14 = (): boolean | undefined => {
    return true
  }

  f3 = (): boolean | undefined => this.or40p14()

  /**
   * Index 4: or-40-p1-5
   */
  or40p15 = (): boolean | undefined => {
    return true
  }

  f4 = (): boolean | undefined => this.or40p15()

  /**
   * Index 5: or-40-p1-6
   */
  or40p16 = (): boolean | undefined => {
    return true
  }

  f5 = (): boolean | undefined => this.or40p16()

  /**
   * Index 6: or-40-p1-7
   */
  or40p17 = (): boolean | undefined => {
    return true
  }

  f6 = (): boolean | undefined => this.or40p17()

  /**
   * Index 7: or-40-p1-8
   */
  or40p18 = (): boolean | undefined => {
    return true
  }

  f7 = (): boolean | undefined => this.or40p18()

  /**
   * Index 8: or-40-p1-9
   */
  or40p19 = (): boolean | undefined => {
    return true
  }

  f8 = (): boolean | undefined => this.or40p19()

  /**
   * Index 9: or-40-p1-10
   */
  or40p110 = (): boolean | undefined => {
    return true
  }

  f9 = (): boolean | undefined => this.or40p110()

  /**
   * Index 10: First Name
   */
  FirstName = (): string | undefined => {
    return undefined
  }

  f10 = (): string | undefined => this.FirstName()

  /**
   * Index 11: Tax Payer's Initial
   */
  TaxPayerInitial = (): string | undefined => {
    return undefined
  }

  f11 = (): string | undefined => this.TaxPayerInitial()

  /**
   * Index 12: Date Of Birth
   */
  DateOfBirth = (): string | undefined => {
    // format: 'xx xx xxxx'
    return undefined
  }

  f12 = (): string | undefined => this.DateOfBirth()

  /**
   * Index 13: or-40-p1-16
   */
  or40p116 = (): boolean | undefined => {
    return true
  }

  f13 = (): boolean | undefined => this.or40p116()

  /**
   * Index 14: or-40-p1-17
   */
  or40p117 = (): boolean | undefined => {
    return true
  }

  f14 = (): boolean | undefined => this.or40p117()

  /**
   * Index 15: or-40-p1-18
   */
  or40p118 = (): boolean | undefined => {
    return true
  }

  f15 = (): boolean | undefined => this.or40p118()

  /**
   * Index 16: LastName (53)
   */
  LastName53 = (): string | undefined => {
    return this.info.taxPayer.primaryPerson?.lastName
  }

  f16 = (): string | undefined => this.LastName53()

  /**
   * Index 17: SSN53
   */
  SocialSecurityNumber53 = (): string | undefined => {
    // format: 'xxx xx xxxx'
    return this.info.taxPayer.primaryPerson?.ssid
  }

  f17 = (): string | undefined => this.SocialSecurityNumber53()

  /**
   * Index 18: or-40-p2-2
   */
  or40p22 = (): boolean | undefined => {
    return true
  }

  f18 = (): boolean | undefined => this.or40p22()

  /**
   * Index 19: or-40-p2-3
   */
  or40p23 = (): boolean | undefined => {
    return true
  }

  f19 = (): boolean | undefined => this.or40p23()

  /**
   * Index 20: or-40-p2-4
   */
  or40p24 = (): boolean | undefined => {
    return true
  }

  f20 = (): boolean | undefined => this.or40p24()

  /**
   * Index 21: 6b
   * Credits for your spouse
   */
  Question6b = (): string | undefined => {
    return undefined
  }

  f21 = (): string | undefined => this.Question6b()

  /**
   * Index 22: or-40-p2-9
   */
  or40p29 = (): boolean | undefined => {
    return true
  }

  f22 = (): boolean | undefined => this.or40p29()

  /**
   * Index 23: Dependant 1 Initial
   */
   Dependant1Initial = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.Dependant1Initial()

  /**
   * Index 24: Dependent 1 LastName
   */
  Dependent1LastName = (): string | undefined => {
    return this.info.taxPayer.dependents[0]?.lastName
  }

  f24 = (): string | undefined => this.Dependent1LastName()

  /**
   * Index 25: Dependent 1 Date Of Birth
   */
  Dependent1DateOfBirth = (): string | undefined => {
    // format: 'xx xx xxxx'
    return undefined
  }

  f25 = (): string | undefined => this.Dependent1DateOfBirth()

  /**
   * Index 26: Dependent 1 SSN
   */
  Dependent1SocialSecurityNumber = (): string | undefined => {
    return this.info.taxPayer.dependents[0]?.ssid
  }

  f26 = (): string | undefined => this.Dependent1SocialSecurityNumber()

  /**
   * Index 27: or-40-p2-17
   */
  or40p217 = (): boolean | undefined => {
    return true
  }

  f27 = (): boolean | undefined => this.or40p217()

  /**
   * Index 28: Dependent 2 First Name
   */
  Dependent2FirstName = (): string | undefined => {
    return this.info.taxPayer.dependents[1]?.firstName
  }

  f28 = (): string | undefined => this.Dependent2FirstName()

  /**
   * Index 29: Dependant 2 Initial
   */
   Dependant2Initial = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.Dependant2Initial()

  /**
   * Index 30: Dependent2LastName
   */
  Dependent2LastName = (): string | undefined => {
    return this.info.taxPayer.dependents[1]?.lastName
  }

  f30 = (): string | undefined => this.Dependent2LastName()

  /**
   * Index 31: Dependent 2 Date Of Birth
   */
  Dependent2DateOfBirth = (): string | undefined => {
    // format: 'xx xx xxxx'
    return undefined
  }

  f31 = (): string | undefined => this.Dependent2DateOfBirth()

  /**
   * Index 32: Dependent2SSN
   */
  Dependent2SocialSecurityNumber = (): string | undefined => {
    // format: 'xxx xx xxxx'
    return this.info.taxPayer.dependents[1]?.ssid
  }

  f32 = (): string | undefined => this.Dependent2SocialSecurityNumber()

  /**
   * Index 33: or-40-p2-24
   */
  or40p224 = (): boolean | undefined => {
    return true
  }

  f33 = (): boolean | undefined => this.or40p224()

  /**
   * Index 34: Dependent3FirstName
   */
  Dependent3FirstName = (): string | undefined => {
    return this.info.taxPayer.dependents[2]?.firstName
  }

  f34 = (): string | undefined => this.Dependent3FirstName()

  /**
   * Index 35: Dependant 3 Initial
   */
  Dependant3Initial = (): string | undefined => {
    return undefined
  }

  f35 = (): string | undefined => this.Dependant3Initial()

  /**
   * Index 36: Dependent3LastName
   */
  Dependent3LastName = (): string | undefined => {
    return this.info.taxPayer.dependents[2]?.lastName
  }

  f36 = (): string | undefined => this.Dependent3LastName()

  /**
   * Index 37: Dependent 3 SSN
   */
  Dependent3SocialSecurityNumber = (): string | undefined => {
    // format: 'xxx xx xxxx'
    return this.info.taxPayer.dependents[2]?.ssid
  }

  f37 = (): string | undefined => this.Dependent3SocialSecurityNumber()

  /**
   * Index 38: or-40-p2-31
   */
  or40p231 = (): boolean | undefined => {
    return true
  }

  f38 = (): boolean | undefined => this.or40p231()

  /**
   * Index 39: 6d
   * # of dependent children with disability
   */
  Question6d = (): string | undefined => {
    return undefined
  }

  f39 = (): string | undefined => this.Question6d()

  /**
   * Index 40: Total Exemptions (6e)
   * Sum 6a through 6d
   */
  TotalExemptions6e = (): string | undefined => {
    return undefined
  }

  f40 = (): string | undefined => this.TotalExemptions6e()

  /**
   * Index 41: or-40-p2-6
   */
  or40p26 = (): boolean | undefined => {
    return true
  }

  f41 = (): boolean | undefined => this.or40p26()

  /**
   * Index 42: or-40-p2-7
   */
  or40p27 = (): boolean | undefined => {
    return true
  }

  f42 = (): boolean | undefined => this.or40p27()

  /**
   * Index 43: or-40-p2-8
   */
  or40p28 = (): boolean | undefined => {
    return true
  }

  f43 = (): boolean | undefined => this.or40p28()

  /**
   * Index 44: 6c
   * Number of dependents
   */
  Question6c = (): string | undefined => {
    return undefined
  }

  f44 = (): string | undefined => this.Question6c()

  /**
   * Index 45: 6a
   * Credits for yourself
   */
  Question6a = (): string | undefined => {
    return undefined
  }

  f45 = (): string | undefined => this.Question6a()

  /**
   * Index 46: Dependent 3 Date Of Birth
   */
  Dependent3DateOfBirth = (): string | undefined => {
    // format 'xx xx xxxx'
    return undefined
  }

  f46 = (): string | undefined => this.Dependent3DateOfBirth()

  /**
   * Index 47: Spouse's First Name
   */
  SpouseFirstName = (): string | undefined => {
    return undefined
  }

  f47 = (): string | undefined => this.SpouseFirstName()

  /**
   * Index 48: Spouse's Initial
   */
   SpouseInitial = (): string | undefined => {
    return undefined
  }

  f48 = (): string | undefined => this.SpouseInitial()

  /**
   * Index 49: Spouse's Date Of Birth
   */
  SpouseDateOfBirth = (): string | undefined => {
    // format: 'xx xx xxxx'
    return undefined
  }

  f49 = (): string | undefined => this.SpouseDateOfBirth()

  /**
   * Index 50: Spouse's Last Name
   */
  SpouseLastName = (): string | undefined => {
    return undefined
  }

  f50 = (): string | undefined => this.SpouseLastName()

  /**
   * Index 51: Spouse's SSN
   */
  SpouseSocialSecurityNumber = (): string | undefined => {
    // format: 'xxx xx xxxx'
    return undefined
  }

  f51 = (): string | undefined => this.SpouseSocialSecurityNumber()

  /**
   * Index 52: or-40-p1-24
   */
  or40p124 = (): boolean | undefined => {
    return true
  }

  f52 = (): boolean | undefined => this.or40p124()

  /**
   * Index 53: or-40-p1-25
   */
  or40p125 = (): boolean | undefined => {
    return true
  }

  f53 = (): boolean | undefined => this.or40p125()

  /**
   * Index 54: or-40-p1-26
   */
  or40p126 = (): boolean | undefined => {
    return true
  }

  f54 = (): boolean | undefined => this.or40p126()

  /**
   * Index 55: Current Address
   */
  CurrentAddress = (): string | undefined => {
    return undefined
  }

  f55 = (): string | undefined => this.CurrentAddress()

  /**
   * Index 56: City
   */
  City = (): string | undefined => {
    return undefined
  }

  f56 = (): string | undefined => this.City()

  /**
   * Index 57: Country
   */
  Country = (): string | undefined => {
    return undefined
  }

  f57 = (): string | undefined => this.Country()

  /**
   * Index 58: Phone
   */
  Phone = (): string | undefined => {
    // format: 'xxx xxx xxxx'
    return undefined
  }

  f58 = (): string | undefined => this.Phone()

  /**
   * Index 59: Amended Return NOL Tax Year
   */
  AmendedReturnNOLTaxYear = (): string | undefined => {
    // format: 'xxxx'
    return undefined
  }

  f59 = (): string | undefined => this.AmendedReturnNOLTaxYear()

  /**
   * Index 60: Dependent1 First Name
   */
  Dependent1FirstName = (): string | undefined => {
    return this.info.taxPayer.dependents[0]?.firstName
  }

  f60 = (): string | undefined => this.Dependent1FirstName()

  /**
   * Index 61: or-40-p3-12
   */
  or40p312 = (): boolean | undefined => {
    return true
  }

  f61 = (): boolean | undefined => this.or40p312()

  /**
   * Index 62: or-40-p3-13
   */
  or40p313 = (): boolean | undefined => {
    return true
  }

  f62 = (): boolean | undefined => this.or40p313()

  /**
   * Index 63: or-40-p3-14
   */
  or40p314 = (): boolean | undefined => {
    return true
  }

  f63 = (): boolean | undefined => this.or40p314()

  /**
   * Index 64: or-40-p3-15
   */
  or40p315 = (): boolean | undefined => {
    return true
  }

  f64 = (): boolean | undefined => this.or40p315()

  /**
   * Index 65: or-40-p4-2
   */
  or40p42 = (): boolean | undefined => {
    return true
  }

  f65 = (): boolean | undefined => this.or40p42()

  /**
   * Index 66: or-40-p4-3
   */
  or40p43 = (): boolean | undefined => {
    return true
  }

  f66 = (): boolean | undefined => this.or40p43()

  /**
   * Index 67: or-40-p4-4
   */
  or40p44 = (): boolean | undefined => {
    return true
  }

  f67 = (): boolean | undefined => this.or40p44()

  /**
   * Index 68: Exemption Number 42a
   */
  ExemptionNumber42a = (): string | undefined => {
    return undefined
  }

  f68 = (): string | undefined => this.ExemptionNumber42a()

  /**
   * Index 69: or-40-p5-13
   */
  or40p513 = (): boolean | undefined => {
    return true
  }

  f69 = (): boolean | undefined => this.or40p513()

  /**
   * Index 70: Party Code You (48a)
   */
  PartyCodeYou48a = (): string | undefined => {
    return undefined
  }

  f70 = (): string | undefined => this.PartyCodeYou48a()

  /**
   * Index 71: Party Code Spouse (48b)
   */
  PartyCodeSpouse48b = (): string | undefined => {
    return undefined
  }

  f71 = (): string | undefined => this.PartyCodeSpouse48b()

  /**
   * Index 72: or-40-p6-11
   */
  or40p611 = (): boolean | undefined => {
    return true
  }

  f72 = (): boolean | undefined => this.or40p611()

  /**
   * Index 73: Routing Number (52)
   */
  RoutingNumber52 = (): string | undefined => {
    return undefined
  }

  f73 = (): string | undefined => this.RoutingNumber52()

  /**
   * Index 74: Account Number (52)
   */
  AccountNumber52 = (): string | undefined => {
    return undefined
  }

  f74 = (): string | undefined => this.AccountNumber52()

  /**
   * Index 75: or-40-p6-16
   */
  or40p616 = (): boolean | undefined => {
    return true
  }

  f75 = (): boolean | undefined => this.or40p616()

  /**
   * Index 76: Your Signature Date
   */
  YourSignatureDate = (): string | undefined => {
    return undefined
  }

  f76 = (): string | undefined => this.YourSignatureDate()

  /**
   * Index 77: Spouse Signature Date
   */
  SpouseSignatureDate = (): string | undefined => {
    return undefined
  }

  f77 = (): string | undefined => this.SpouseSignatureDate()

  /**
   * Index 78: Preparer Signature Date
   */
   PreparerSignatureDate = (): string | undefined => {
    return undefined
  }

  f78 = (): string | undefined => this.PreparerSignatureDate()

  /**
   * Index 79: Preparer Phone Number
   */
   PreparerPhoneNumber = (): string | undefined => {
    return undefined
  }

  f79 = (): string | undefined => this.PreparerPhoneNumber()

  /**
   * Index 80: Preparer License Number
   */
   PreparerLicenseNumber = (): string | undefined => {
    return undefined
  }

  f80 = (): string | undefined => this.PreparerLicenseNumber()

  /**
   * Index 81: Preparer First Name
   */
  PreparerFirstName = (): string | undefined => {
    return undefined
  }

  f81 = (): string | undefined => this.PreparerFirstName()

  /**
   * Index 82: Preparer's Initial
   */
   PreparerInitial = (): string | undefined => {
    return undefined
  }

  f82 = (): string | undefined => this.PreparerInitial()

  /**
   * Index 83: Preparer Last Name
   */
   PreparerLastName = (): string | undefined => {
    return undefined
  }

  f83 = (): string | undefined => this.PreparerLastName()

  /**
   * Index 84: Preparer Street Address
   */
   PreparerStreetAddress = (): string | undefined => {
    return undefined
  }

  f84 = (): string | undefined => this.PreparerStreetAddress()

  /**
   * Index 85: Preparer City
   */
  PreparerCity = (): string | undefined => {
    return undefined
  }

  f85 = (): string | undefined => this.PreparerCity()

  /**
   * Index 86: Preparer State
   */
  PreparerState = (): string | undefined => {
    return undefined
  }

  f86 = (): string | undefined => this.PreparerState()

  /**
   * Index 87: Former Identification Number
   * If new SSN
   */
  FormerIdentificationNumber = (): string | undefined => {
    return undefined
  }

  f87 = (): string | undefined => this.FormerIdentificationNumber()

  /**
   * Index 88: Fed. Adjusted Gross Income (7)
   */
  FedAdjustedGrossIncome7 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f88 = (): string | undefined => this.FedAdjustedGrossIncome7()

  /**
   * Index 89: Total Additions Schedule OR-ASC (8)
   */
  TotalAdditionsScheduleASC8 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f89 = (): string | undefined => this.TotalAdditionsScheduleASC8()

  /**
   * Index 90: Income and Additions (9)
   * Sum 7 and 8
   */
  IncomeAndAdditions9 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f90 = (): string | undefined => this.IncomeAndAdditions9()

  /**
   * Index 91: Oregon Itemized Deductions (16)
   * schedule OR-A line 23 or 0
   */
  OregonItemizedDeductions16 = (): string | undefined => {
    return undefined
  }

  f91 = (): string | undefined => this.OregonItemizedDeductions16()

  /**
   * Index 92: Standardized Deduction (17)
   */
  StandardizedDeduction17 = (): string | undefined => {
    return undefined
  }

  f92 = (): string | undefined => this.StandardizedDeduction17()

  /**
   * Index 93: Larger Deduction (18)
   * larger of 16 and 17
   */
  LargerDeduction18 = (): string | undefined => {
    return undefined
  }

  f93 = (): string | undefined => this.LargerDeduction18()

  /**
   * Index 94: Oregon Taxable Income (19)
   * line 15 - line 18, min 0
   */
  OregonTaxableIncome19 = (): string | undefined => {
    return undefined
  }

  f94 = (): string | undefined => this.OregonTaxableIncome19()

  /**
   * Index 95: Federal Tax Liability (10)
   */
  FederalTaxLiability10 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f95 = (): string | undefined => this.FederalTaxLiability10()

  /**
   * Index 96: Social Security Amount (11)
   */
  SocialSecurityAmount11 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f96 = (): string | undefined => this.SocialSecurityAmount11()

  /**
   * Index 97: OR Income Tax Refund (12)
   */
  ORIncomeTaxRefund12 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f97 = (): string | undefined => this.ORIncomeTaxRefund12()

  /**
   * Index 98: All Subtractions Schedule OR-ASC (13)
   */
  AllSubtractionsScheduleASC13 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f98 = (): string | undefined => this.AllSubtractionsScheduleASC13()

  /**
   * Index 99: Total Subtractions (14)
   * Sum lines 10 - 13
   */
  TotalSubtractions14 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f99 = (): string | undefined => this.TotalSubtractions14()

  /**
   * Index 100: Income After Subtractions (15)
   * line 9 - line 14
   */
  IncomeAfterSubtractions15 = (): string | undefined => {
    // format: 'xxx xxx xxx'
    return undefined
  }

  f100 = (): string | undefined => this.IncomeAfterSubtractions15()

  /**
   * Index 101: Tax (20)
   */
  Tax20 = (): string | undefined => {
    return undefined
  }

  f101 = (): string | undefined => this.Tax20()

  /**
   * Index 102: Intrest On Certain Installments (21)
   */
  IntrestOnCertainInstallments21 = (): string | undefined => {
    return undefined
  }

  f102 = (): string | undefined => this.IntrestOnCertainInstallments21()

  /**
   * Index 103: Total Tax Before Credits (22)
   * Sum lines 20, 21
   */
  TotalTaxBeforeCredits22 = (): string | undefined => {
    return undefined
  }

  f103 = (): string | undefined => this.TotalTaxBeforeCredits22()

  /**
   * Index 104: Exemption Credit (23)
   * if the amount on line 7 is $100,000 or less,
   * multiply your total exemptions on line 6e by $213.
   * Otherwise, see instructions
   */
  ExemptionCredit23 = (): string | undefined => {
    return undefined
  }

  f104 = (): string | undefined => this.ExemptionCredit23()

  /**
   * Index 105: Political Contribution Credit (24)
   */
  PoliticalContributionCredit24 = (): string | undefined => {
    return undefined
  }

  f105 = (): string | undefined => this.PoliticalContributionCredit24()

  /**
   * Index 106: Standard Credits Schedule OR-ASC (25)
   * Section C
   */
  StandardCreditsScheduleASC25 = (): string | undefined => {
    return undefined
  }

  f106 = (): string | undefined => this.StandardCreditsScheduleASC25()

  /**
   * Index 107: Total Standard Credits (26)
   * Sum lines 23-25
   */
  TotalStandardCredits26 = (): string | undefined => {
    return undefined
  }

  f107 = (): string | undefined => this.TotalStandardCredits26()

  /**
   * Index 108: OR Income Tax Withheld (32)
   */
  ORIncomeTaxWithheld32 = (): string | undefined => {
    return undefined
  }

  f108 = (): string | undefined => this.ORIncomeTaxWithheld32()

  /**
   * Index 109: Prior Year Tax Refund (33)
   */
  PriorYearTaxRefund33 = (): string | undefined => {
    return undefined
  }

  f109 = (): string | undefined => this.PriorYearTaxRefund33()

  /**
   * Index 110: Est. 2021 Tax Payments (34)
   * Don't include line 33
   */
  Est2021TaxPayments34 = (): string | undefined => {
    return undefined
  }

  f110 = (): string | undefined => this.Est2021TaxPayments34()

  /**
   * Index 111: Earned Income Credit (35)
   */
  EarnedIncomeCredit35 = (): string | undefined => {
    return undefined
  }

  f111 = (): string | undefined => this.EarnedIncomeCredit35()

  /**
   * Index 112: Kicker Credit Amount (35)
   * Enter 0 to donate to State School Fund, see line 53
   */
   KickerCreditAmount36 = (): string | undefined => {
    return undefined
  }

  f112 = (): string | undefined => this.KickerCreditAmount36()

  /**
   * Index 113: Total Refundable Credits Schedule OR-ASC (36)
   * Section F
   */
  TotalRefundableCreditsScheduleASC37 = (): string | undefined => {
    return undefined
  }

  f113 = (): string | undefined => this.TotalRefundableCreditsScheduleASC37()

  /**
   * Index 114: Total Payments And Refund Credits (38)
   * Sum lines 32 - 37
   */
  TotalPaymentsAndRefundCredits38 = (): string | undefined => {
    return undefined
  }

  f114 = (): string | undefined => this.TotalPaymentsAndRefundCredits38()

  /**
   * Index 115: Overpayment Of Tax (39)
   * Line 38 - line 31, if line 31 is less than line 38
   */
  OverpaymentOfTax39 = (): string | undefined => {
    return undefined
  }

  f115 = (): string | undefined => this.OverpaymentOfTax39()

  /**
   * Index 116: Net Tax (40)
   * Line 31 - line 38, if line 38 is less than line 31
   */
  NetTax40 = (): string | undefined => {
    return undefined
  }

  f116 = (): string | undefined => this.NetTax40()

  /**
   * Index 117: Late Filing Penalty And Interest (41)
   */
  LateFilingPenaltyAndInterest41 = (): string | undefined => {
    return undefined
  }

  f117 = (): string | undefined => this.LateFilingPenaltyAndInterest41()

  /**
   * Index 118: Intrest On Underpayment of Est. OR-10 Tax (42)
   */
  IntrestOnUnderpaymentOfEstOR10Tax42 = (): string | undefined => {
    return undefined
  }

  f118 = (): string | undefined => this.IntrestOnUnderpaymentOfEstOR10Tax42()

  /**
   * Index 119: Total Penalty + Intrest Due (43)
   */
  TotalPenaltyIntrestDue43 = (): string | undefined => {
    return undefined
  }

  f119 = (): string | undefined => this.TotalPenaltyIntrestDue43()

  /**
   * Index 120: Tax Minus Standard Credits (27)
   * Line 22 - line 26, min 0
   */
  TaxMinusStandardCredits27 = (): string | undefined => {
    return undefined
  }

  f120 = (): string | undefined => this.TaxMinusStandardCredits27()

  /**
   * Index 121: Total Carryforward Credits Schedule OR-ASC (28)
   * Section D, no larger than line 27
   */
  TotalCarryforwardCreditsScheduleASC28 = (): string | undefined => {
    return undefined
  }

  f121 = (): string | undefined => this.TotalCarryforwardCreditsScheduleASC28()

  /**
   * Index 122: Tax After Standard and Carryforward Credits (29)
   * Line 27 - Line 28
   */
  TaxAfterStandardCarryforwardCredits29 = (): string | undefined => {
    return undefined
  }

  f122 = (): string | undefined => this.TaxAfterStandardCarryforwardCredits29()

  /**
   * Index 123: Total Credit Recaptures Schedule OR-ASC (30)
   * OR-ASC, Section E
   */
  TotalCreditRecapturesScheduleASC30 = (): string | undefined => {
    return undefined
  }

  f123 = (): string | undefined => this.TotalCreditRecapturesScheduleASC30()

  /**
   * Index 124: Tax After Credit Recaptures (31)
   * Line 29 + Line 30
   */
  TaxAfterCreditRecaptures31 = (): string | undefined => {
    return undefined
  }

  f124 = (): string | undefined => this.TaxAfterCreditRecaptures31()

  /**
   * Index 125: Net Tax Including Penalty and Interest (44)
   * Line 40 - Line 43
   */
  NetTaxInclPenaltyInterest44 = (): string | undefined => {
    return undefined
  }

  f125 = (): string | undefined => this.NetTaxInclPenaltyInterest44()

  /**
   * Index 126: Overpayment Less Penalty and Interest (45)
   * Line 39 - Line 43
   */
  OverpaymentLessPenaltyInterest45 = (): string | undefined => {
    return undefined
  }

  f126 = (): string | undefined => this.OverpaymentLessPenaltyInterest45()

  /**
   * Index 127: Estimated Tax (46)
   * Portion of Line 45 appl. to open estimated tax acc
   */
  EstimatedTax46 = (): string | undefined => {
    return undefined
  }

  f127 = (): string | undefined => this.EstimatedTax46()

  /**
   * Index 128: Charitable Checkoff Donations Schedule OR-DONATE (47)
   * Schedule OR-DONATE, Line 30
   */
  CharitableCheckoffScheduleDONATE47 = (): string | undefined => {
    return undefined
  }

  f128 = (): string | undefined => this.CharitableCheckoffScheduleDONATE47()

  /**
   * Index 129: Political Party $3 Checkoff (48)
   */
  PoliticalPartyCheckoff48 = (): string | undefined => {
    return undefined
  }

  f129 = (): string | undefined => this.PoliticalPartyCheckoff48()

  /**
   * Index 130: Oregon 529 College Savings Plan Deposits Schedule OR-529 (49)
   */ 
  CollegeSavingsPlanDepositSchedule52949 = (): string | undefined => {
    return undefined
  }

  f130 = (): string | undefined => this.CollegeSavingsPlanDepositSchedule52949()

  /**
   * Index 131: Total (50)
   * Add Lines 46 - 49, Line 50 < Line 45
   */
  TotalTax50 = (): string | undefined => {
    return undefined
  }

  f131 = (): string | undefined => this.TotalTax50()

  /**
   * Index 132: Kicker Donation (53b)
   */
  KickerDonation53b = (): string | undefined => {
    return undefined
  }

  f132 = (): string | undefined => this.KickerDonation53b()

  /**
   * Index 133: Net Refund (51)
   * Line 45 - Line 50
   */
  NetRefund51 = (): string | undefined => {
    return undefined
  }

  f133 = (): string | undefined => this.NetRefund51()

  /**
   * Index 134: or-40_p1_33
   */
  or40p133 = (): string | undefined => {
    return undefined
  }

  f134 = (): string | undefined => this.or40p133()

  /**
   * Index 135: Tax Payer's State
   */
  TaxPayerState = (): string | undefined => {
    return undefined
  }

  f135 = (): string | undefined => this.TaxPayerState()

  /**
   * Index 136: Dependant 1 Code
   */
  Dependant1Code = (): string | undefined => {
    return undefined
  }

  f136 = (): string | undefined => this.Dependant1Code()

  /**
   * Index 137: Dependant 2 Code
   */
  Dependant2Code = (): string | undefined => {
    return undefined
  }

  f137 = (): string | undefined => this.Dependant2Code()

  /**
   * Index 138: Dependant 3 Code
   */
  Dependant3Code = (): string | undefined => {
    return undefined
  }

  f138 = (): string | undefined => this.Dependant3Code()

  /**
   * Index 139: or-40-p6-12
   */
  or40p612 = (): string | undefined => {
    return undefined
  }

  f139 = (): string | undefined => this.or40p612()

  /**
   * Index 140: Preparer ZIP 
   */
  PreparerZip1 = (): string | undefined => {
    return undefined
  }

  f140 = (): string | undefined => this.PreparerZip1()

  /**
   * Index 141: Preparer ZIP Area
   */
  PreparerZip2 = (): string | undefined => {
    return undefined
  }

  f141 = (): string | undefined => this.PreparerZip2()

  /**
   * Index 142: ZIPCode ()
   */
  ZipCode = (): string | undefined => {
    return undefined
  }

  f142 = (): string | undefined => this.ZipCode()

  /**
   * Index 143: ZIP extension
   */
  ZipExtension = (): string | undefined => {
    return undefined
  }

  f143 = (): string | undefined => this.ZipExtension()

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
    this.f104(),
    this.f105(),
    this.f106(),
    this.f107(),
    this.f108(),
    this.f109(),
    this.f110(),
    this.f111(),
    this.f112(),
    this.f113(),
    this.f114(),
    this.f115(),
    this.f116(),
    this.f117(),
    this.f118(),
    this.f119(),
    this.f120(),
    this.f121(),
    this.f122(),
    this.f123(),
    this.f124(),
    this.f125(),
    this.f126(),
    this.f127(),
    this.f128(),
    this.f129(),
    this.f130(),
    this.f131(),
    this.f132(),
    this.f133(),
    this.f134(),
    this.f135(),
    this.f136(),
    this.f137(),
    this.f138(),
    this.f139(),
    this.f140(),
    this.f141(),
    this.f142(),
    this.f143()
  ]
  // .map((value, i) => {
  //   let ret = value
  //   if (!ret) {
  //     if (i === 11 || i === 23 || i === 29 || i === 35 || i === 48 || i === 68 || i === 82 || i === 135 || i === 136 || i === 137 || i === 138) {
  //       ret = 'a'
  //     } else {
  //       ret = i.toString()
  //     }
  //   }
  //   return ret
  // })
}

const makeOR40 = (info: Information, f1040: F1040): OR40 =>
  new OR40(info, f1040)

export default makeOR40
