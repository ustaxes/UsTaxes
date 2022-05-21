import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
// import { sumFields } from 'ustaxes/core/irsForms/util'
import { AccountType, FilingStatus, State } from 'ustaxes/core/data'
// import parameters from './Parameters'
import { ORWFHDC } from './ORWFHDC'
import OR40V from './OR40V'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

export class OR40 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  scheduleWFHDC: ORWFHDC
  or40V: OR40V
  formOrder = 0
  methods: FormMethods

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'OR-40'
    this.state = 'OR'
    this.scheduleWFHDC = new ORWFHDC(f1040)
    this.or40V = new OR40V(f1040, this)
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

  formatSocialSecurity(ssid: string | undefined): string | undefined {
    ssid = ssid?.replace(/\D/g, '')
    ssid = ssid?.replace(/^(\d{3})/, '$1 ')
    ssid = ssid?.replace(/ (\d{2})/, ' $1 ')
    ssid = ssid?.replace(/(\d) (\d{4}).*/, '$1 $2')
    return ssid
  }

  formatDollarAmount(amount: number | undefined): string | undefined {
    let result: string | undefined = amount?.toString()
    result = result?.replace(/.{3}$/, ' $&')
    result = result?.replace(/.{7}$/, ' $&')
    return result?.padStart(11)
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
   * Index 2: Ammended Return
   */
  AmmendedReturn = (): boolean | undefined => {
    return true
  }

  f2 = (): boolean | undefined => this.AmmendedReturn()

  /**
   * Index 3: Calculated "As If" Federal Return
   */
  CalcAsIfFedReturn = (): boolean | undefined => {
    return true
  }

  f3 = (): boolean | undefined => this.CalcAsIfFedReturn()

  /**
   * Index 4: Short-Year Tax Election
   */
  ShortYearTaxElection = (): boolean | undefined => {
    return true
  }

  f4 = (): boolean | undefined => this.ShortYearTaxElection()

  /**
   * Index 5: Extension Field
   */
  ExtensionField = (): boolean | undefined => {
    return true
  }

  f5 = (): boolean | undefined => this.ExtensionField()

  /**
   * Index 6: Form OR-24
   */
  FormOR24 = (): boolean | undefined => {
    return true
  }

  f6 = (): boolean | undefined => this.FormOR24()

  /**
   * Index 7: Federal Form 8379
   */
  FederalForm8379 = (): boolean | undefined => {
    return true
  }

  f7 = (): boolean | undefined => this.FederalForm8379()

  /**
   * Index 8: Federal Form 8886
   */
  FederalForm8886 = (): boolean | undefined => {
    return true
  }

  f8 = (): boolean | undefined => this.FederalForm8886()

  /**
   * Index 9: Disaster Relief
   */
  DisasterRelief = (): boolean | undefined => {
    return true
  }

  f9 = (): boolean | undefined => this.DisasterRelief()

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
   * Index 13: First Time Using This SSN
   */
  FirstTimeUsingThisSSN = (): boolean | undefined => {
    return true
  }

  f13 = (): boolean | undefined => this.FirstTimeUsingThisSSN()

  /**
   * Index 14: Applied for ITIN
   */
  AppliedForITIN = (): boolean | undefined => {
    return true
  }

  f14 = (): boolean | undefined => this.AppliedForITIN()

  /**
   * Index 15: Deceased
   */
  Deceased = (): boolean | undefined => {
    return true
  }

  f15 = (): boolean | undefined => this.Deceased()

  /**
   * Index 16: LastName (53)
   */
  LastName53 = (): string | undefined => {
    return this.info.taxPayer.primaryPerson.lastName
  }

  f16 = (): string | undefined => this.LastName53()

  /**
   * Index 17: SSN53
   */
  SocialSecurityNumber53 = (): string | undefined => {
    // format: 'xxx xx xxxx'
    return this.formatSocialSecurity(this.info.taxPayer.primaryPerson.ssid)
  }

  f17 = (): string | undefined => this.SocialSecurityNumber53()

  /**
   * Index 18: Regular (6a)
   */
  Regular6a = (): boolean | undefined => {
    // If taxpayer can be claimed as a dependent then don't check the box.
    return !this.ClaimAsDependent6a()
  }

  f18 = (): boolean | undefined => this.Regular6a()

  /**
   * Index 19: Severely Disabled (6a)
   */
  SeverelyDisabled6a = (): boolean | undefined => {
    return this.info.stateQuestions.OR_6A_TAXPAYER_SEVERELY_DISABLED ?? false
  }

  f19 = (): boolean | undefined => this.SeverelyDisabled6a()

  /**
   * Index 20: Claim As Dependent (6a)
   */
  ClaimAsDependent6a = (): boolean | undefined => {
    return this.info.taxPayer.primaryPerson.isTaxpayerDependent
  }

  f20 = (): boolean | undefined => this.ClaimAsDependent6a()

  /**
   * Index 21: 6b
   * Credits for your spouse
   */
  Question6b = (): string | undefined => {
    const regularCredit: number = this.SpouseRegular6b() ? 1 : 0
    const disabledCredit: number = this.SpouseSeverelyDisabled6b() ? 1 : 0
    // TODO: Fix one digit text alignment - should be right justified
    return (regularCredit + disabledCredit).toString().padStart(2)
  }

  f21 = (): string | undefined => this.Question6b()

  /**
   * Index 22: More Than Three Dependents
   */
  MoreThanThreeDependents = (): boolean | undefined => {
    return this.info.taxPayer.dependents.length > 3
  }

  f22 = (): boolean | undefined => this.MoreThanThreeDependents()

  /**
   * Index 23: Dependent 1 Initial
   */
  Dependent1Initial = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.Dependent1Initial()

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
    return this.formatSocialSecurity(this.info.taxPayer.dependents[0]?.ssid)
  }

  f26 = (): string | undefined => this.Dependent1SocialSecurityNumber()

  /**
   * Index 27: Dependent 1 Has Disability
   */
  Dependent1HasDisability = (): boolean | undefined => {
    return true
  }

  f27 = (): boolean | undefined => this.Dependent1HasDisability()

  /**
   * Index 28: Dependent 2 First Name
   */
  Dependent2FirstName = (): string | undefined => {
    return this.info.taxPayer.dependents[1]?.firstName
  }

  f28 = (): string | undefined => this.Dependent2FirstName()

  /**
   * Index 29: Dependent 2 Initial
   */
  Dependent2Initial = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.Dependent2Initial()

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
    return this.formatSocialSecurity(this.info.taxPayer.dependents[1]?.ssid)
  }

  f32 = (): string | undefined => this.Dependent2SocialSecurityNumber()

  /**
   * Index 33: Dependent 2 Has Disability
   */
  Dependent2HasDisability = (): boolean | undefined => {
    return false
  }

  f33 = (): boolean | undefined => this.Dependent2HasDisability()

  /**
   * Index 34: Dependent3FirstName
   */
  Dependent3FirstName = (): string | undefined => {
    return this.info.taxPayer.dependents[2]?.firstName
  }

  f34 = (): string | undefined => this.Dependent3FirstName()

  /**
   * Index 35: Dependent 3 Initial
   */
  Dependent3Initial = (): string | undefined => {
    return undefined
  }

  f35 = (): string | undefined => this.Dependent3Initial()

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
    return this.formatSocialSecurity(this.info.taxPayer.dependents[2]?.ssid)
  }

  f37 = (): string | undefined => this.Dependent3SocialSecurityNumber()

  /**
   * Index 38: Dependent 3 Has Disability
   */
  Dependent3HasDisability = (): boolean | undefined => {
    return false
  }

  f38 = (): boolean | undefined => this.Dependent3HasDisability()

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
    // TODO: Fix one digit text alignment - should be right justified
    return (
      parseInt(this.Question6a() ?? '0') +
      parseInt(this.Question6b() ?? '0') +
      parseInt(this.Question6c() ?? '0') +
      parseInt(this.Question6d() ?? '0')
    )
      .toString()
      .padStart(2)
  }

  f40 = (): string | undefined => this.TotalExemptions6e()

  /**
   * Index 41: Spouse Regular (6b)
   */
  SpouseRegular6b = (): boolean | undefined => {
    return this.info.taxPayer.spouse ? !this.SpouseClaimAsDependent6b() : false
  }

  f41 = (): boolean | undefined => this.SpouseRegular6b()

  /**
   * Index 42: Spouse Severely Disabled (6b)
   */
  SpouseSeverelyDisabled6b = (): boolean | undefined => {
    return this.info.stateQuestions.OR_6B_SPOUSE_SEVERELY_DISABLED ?? false
  }

  f42 = (): boolean | undefined => this.SpouseSeverelyDisabled6b()

  /**
   * Index 43: Spouse Claim As Dependent (6b)
   */
  SpouseClaimAsDependent6b = (): boolean | undefined => {
    return this.info.taxPayer.spouse?.isTaxpayerDependent ?? false
  }

  f43 = (): boolean | undefined => this.SpouseClaimAsDependent6b()

  /**
   * Index 44: 6c
   * Number of dependents
   */
  Question6c = (): string | undefined => {
    // TODO: Fix one digit text alignment - should be right justified
    return this.info.taxPayer.dependents.length.toString().padStart(2)
  }

  f44 = (): string | undefined => this.Question6c()

  /**
   * Index 45: 6a
   * Credits for yourself
   */
  Question6a = (): string | undefined => {
    const regularCredit: number = this.Regular6a() ? 1 : 0
    const disabledCredit: number = this.SeverelyDisabled6a() ? 1 : 0
    // TODO: Fix one digit text alignment - should be right justified
    return (regularCredit + disabledCredit).toString().padStart(2)
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
   * Index 52: Spouse First Time Using SSN
   */
  SpouseFirstTimeUsingSSN = (): boolean | undefined => {
    return true
  }

  f52 = (): boolean | undefined => this.SpouseFirstTimeUsingSSN()

  /**
   * Index 53: Spouse Applied For ITIN
   */
  SpouseAppliedForITIN = (): boolean | undefined => {
    return true
  }

  f53 = (): boolean | undefined => this.SpouseAppliedForITIN()

  /**
   * Index 54: Spouse Deceased
   */
  SpouseDeceased = (): boolean | undefined => {
    return true
  }

  f54 = (): boolean | undefined => this.SpouseDeceased()

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
   * Index 61: Standard Deduction 65 or older (17a)
   */
  StandardDeduction65older17a = (): boolean | undefined => {
    return true
  }

  f61 = (): boolean | undefined => this.StandardDeduction65older17a()

  /**
   * Index 62: Standard Deduction Blind (17b)
   */
  StandardDeductionBlind17b = (): boolean | undefined => {
    return true
  }

  f62 = (): boolean | undefined => this.StandardDeductionBlind17b()

  /**
   * Index 63: Standard Deduction Spouse 65 or older (17c)
   */
  StandardDeductionSpouse65older17c = (): boolean | undefined => {
    return true
  }

  f63 = (): boolean | undefined => this.StandardDeductionSpouse65older17c()

  /**
   * Index 64: Standard Deduction Spouse Blind (17d)
   */
  StandardDeductionSpouseBlind17d = (): boolean | undefined => {
    return true
  }

  f64 = (): boolean | undefined => this.StandardDeductionSpouseBlind17d()

  /**
   * Index 65: Schedule OR-FIA-40
   */
  ScheduleORFIA40 = (): boolean | undefined => {
    return true
  }

  f65 = (): boolean | undefined => this.ScheduleORFIA40()

  /**
   * Index 66: Worksheet FCG
   */
  WorksheetFCG = (): boolean | undefined => {
    return true
  }

  f66 = (): boolean | undefined => this.WorksheetFCG()

  /**
   * Index 67: Schedule OR-PTE-FY
   */
  ScheduleORPTEFY = (): boolean | undefined => {
    return true
  }

  f67 = (): boolean | undefined => this.ScheduleORPTEFY()

  /**
   * Index 68: Exemption Number 42a
   */
  ExemptionNumber42a = (): string | undefined => {
    return this.info.stateQuestions.OR_42a_EXCEPTION_NUMBER
  }

  f68 = (): string | undefined => this.ExemptionNumber42a()

  /**
   * Index 69: Form OR-10 Anualized (42b)
   */
  FormOR10Annualized42b = (): boolean | undefined => {
    return this.info.stateQuestions.OR_42b_ANNUALIZED
  }

  f69 = (): boolean | undefined => this.FormOR10Annualized42b()

  /**
   * Index 70: Party Code You (48a)
   */
  PartyCodeYou48a = (): string | undefined => {
    return this.info.stateQuestions.OR_48a_TAXPAYER_POLITICAL_PARTY_CODE
  }

  f70 = (): string | undefined => this.PartyCodeYou48a()

  /**
   * Index 71: Party Code Spouse (48b)
   */
  PartyCodeSpouse48b = (): string | undefined => {
    return this.info.stateQuestions.OR_48b_SPOUSE_POLITICAL_PARTY_CODE
  }

  f71 = (): string | undefined => this.PartyCodeSpouse48b()

  /**
   * Index 72: Final Deposit Destination Outside US (52)
   *
   * this section has a radio button question
   */
  FinalDepositDestinationOutsideUS52 = (): boolean | undefined => {
    return true
  }

  f72 = (): boolean | undefined => this.FinalDepositDestinationOutsideUS52()

  /**
   * Index 73: Routing Number (52)
   */
  RoutingNumber52 = (): string | undefined => {
    return this.info.refund?.routingNumber
  }

  f73 = (): string | undefined => this.RoutingNumber52()

  /**
   * Index 74: Account Number (52)
   */
  AccountNumber52 = (): string | undefined => {
    // TODO: Fix text alignment - should be right justified
    return this.info.refund?.accountNumber.padStart(17)
  }

  f74 = (): string | undefined => this.AccountNumber52()

  /**
   * Index 75: Kicker To State School Fund (53a)
   */
  KickerToStateSchoolFund53a = (): boolean | undefined => {
    return this.info.stateQuestions.OR_53_DONATE_TO_STATE_SCHOOL_FUND
  }

  f75 = (): boolean | undefined => this.KickerToStateSchoolFund53a()

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
    return this.formatDollarAmount(
      parseInt(this.info.stateQuestions.OR_32_OREGON_INCOME_TAX_WITHHELD ?? '0')
    )
  }

  f108 = (): string | undefined => this.ORIncomeTaxWithheld32()

  /**
   * Index 109: Prior Year Tax Refund (33)
   */
  PriorYearTaxRefund33 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.info.stateQuestions.OR_33_AMOUNT_APPLIED_FROM_PRIOR_YEAR_REFUND ??
          '0'
      )
    )
  }

  f109 = (): string | undefined => this.PriorYearTaxRefund33()

  /**
   * Index 110: Est. 2021 Tax Payments (34)
   * Don't include line 33
   */
  Est2021TaxPayments34 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(this.info.stateQuestions.OR_34_ESTIMATED_TAX_PAYMENTS ?? '0')
    )
  }

  f110 = (): string | undefined => this.Est2021TaxPayments34()

  /**
   * Index 111: Earned Income Credit (35)
   */
  EarnedIncomeCredit35 = (): string | undefined => {
    // const earnedIncomeCredit = 13145 // TODO: Call `calculateEICForIncome()` in src\forms\Y2021\irsForms\ScheduleEIC.ts here
    // The multiplier is 9% for taxpayers with no dependents or dependents strictly >=3 years old
    // let multiplier = 0.09
    // if (this.info.taxPayer.dependents.length > 0) {
    //   for (const dependent of this.info.taxPayer.dependents) {
    //     // The multiplier is 12% for taxpayers with one or more dependents strictly <3 years old
    //     if (CHECK AGE HERE)
    //       // TODO: Check dependent's age here
    //       multiplier = 0.12
    //   }
    // }
    // return this.formatDollarAmount(
    //   parseInt((earnedIncomeCredit * multiplier).toString())
    // )
    return undefined
  }

  f111 = (): string | undefined => this.EarnedIncomeCredit35()

  /**
   * Index 112: Kicker Credit Amount (35)
   * Enter 0 to donate to State School Fund, see line 53
   */
  KickerCreditAmount36 = (): string | undefined => {
    if (this.KickerToStateSchoolFund53a() === false) {
      return this.formatDollarAmount(
        parseInt(
          this.info.stateQuestions.OR_36_53_KICKER_OREGON_SURPLUS_CREDIT ?? '0'
        )
      )
    } else {
      return '0'
    }
  }

  f112 = (): string | undefined => this.KickerCreditAmount36()

  /**
   * Index 113: Total Refundable Credits Schedule OR-ASC (36)
   * Section F
   */
  TotalRefundableCreditsScheduleASC37 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.info.stateQuestions.OR_37_TOTAL_REFUNDABLE_CREDITS_FROM_OR_ASC ??
          '0'
      )
    )
  }

  f113 = (): string | undefined => this.TotalRefundableCreditsScheduleASC37()

  /**
   * Index 114: Total Payments And Refund Credits (38)
   * Sum lines 32 - 37
   */
  TotalPaymentsAndRefundCredits38 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(this.ORIncomeTaxWithheld32()?.replace(/\s/g, '') ?? '0') +
        parseInt(this.PriorYearTaxRefund33()?.replace(/\s/g, '') ?? '0') +
        parseInt(this.Est2021TaxPayments34()?.replace(/\s/g, '') ?? '0') +
        parseInt(this.EarnedIncomeCredit35()?.replace(/\s/g, '') ?? '0') +
        parseInt(this.KickerCreditAmount36()?.replace(/\s/g, '') ?? '0') +
        parseInt(
          this.TotalRefundableCreditsScheduleASC37()?.replace(/\s/g, '') ?? '0'
        )
    )
  }

  f114 = (): string | undefined => this.TotalPaymentsAndRefundCredits38()

  /**
   * Index 115: Overpayment Of Tax (39)
   * Line 38 - line 31, if line 31 is less than line 38
   */
  OverpaymentOfTax39 = (): string | undefined => {
    const line31 = parseInt(
      this.TaxAfterCreditRecaptures31()?.replace(/\s/g, '') ?? '0'
    )
    const line38 = parseInt(
      this.TotalPaymentsAndRefundCredits38()?.replace(/\s/g, '') ?? '0'
    )

    const result = line31 < line38 ? line38 - line31 : 0

    return this.formatDollarAmount(result)
  }

  f115 = (): string | undefined => this.OverpaymentOfTax39()

  /**
   * Index 116: Net Tax (40)
   * Line 31 - line 38, if line 38 is less than line 31
   */
  NetTax40 = (): string | undefined => {
    const line31 = parseInt(
      this.TaxAfterCreditRecaptures31()?.replace(/\s/g, '') ?? '0'
    )
    const line38 = parseInt(
      this.TotalPaymentsAndRefundCredits38()?.replace(/\s/g, '') ?? '0'
    )

    const result = line38 < line31 ? line31 - line38 : 0

    return this.formatDollarAmount(result)
  }

  f116 = (): string | undefined => this.NetTax40()

  /**
   * Index 117: Late Filing Penalty And Interest (41)
   */
  LateFilingPenaltyAndInterest41 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(this.info.stateQuestions.OR_41_PENALTY_FOR_FILING_LATE ?? '0')
    )
  }

  f117 = (): string | undefined => this.LateFilingPenaltyAndInterest41()

  /**
   * Index 118: Interest On Underpayment of Est. OR-10 Tax (42)
   */
  InterestOnUnderpaymentOfEstOR10Tax42 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.info.stateQuestions.OR_42_INTEREST_ON_UNDERPAYMENT_OF_EST_TAX ??
          '0'
      )
    )
  }

  f118 = (): string | undefined => this.InterestOnUnderpaymentOfEstOR10Tax42()

  /**
   * Index 119: Total Penalty + Intrest Due (43)
   */
  TotalPenaltyInterestDue43 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.LateFilingPenaltyAndInterest41()?.replace(/\s/g, '') ?? '0'
      ) +
        parseInt(
          this.InterestOnUnderpaymentOfEstOR10Tax42()?.replace(/\s/g, '') ?? '0'
        )
    )
  }

  f119 = (): string | undefined => this.TotalPenaltyInterestDue43()

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
   * Line 40 + Line 43
   */
  NetTaxInclPenaltyInterest44 = (): string | undefined => {
    const netTax = parseInt(this.NetTax40()?.replace(/\s/g, '') ?? '0')
    const overpayment = parseInt(
      this.OverpaymentOfTax39()?.replace(/\s/g, '') ?? '0'
    )
    const penaltiesAndInterest = parseInt(
      this.TotalPenaltyInterestDue43()?.replace(/\s/g, '') ?? '0'
    )

    // See: OR-40-FY Amount due (44)
    if (overpayment > 0 && penaltiesAndInterest > overpayment) {
      return this.formatDollarAmount(penaltiesAndInterest - overpayment)
    } else {
      return this.formatDollarAmount(netTax + penaltiesAndInterest)
    }
  }

  f125 = (): string | undefined => this.NetTaxInclPenaltyInterest44()

  /**
   * Index 126: Overpayment Less Penalty and Interest (45)
   * Line 39 - Line 43
   */
  OverpaymentLessPenaltyInterest45 = (): string | undefined => {
    const overpayment = parseInt(
      this.OverpaymentOfTax39()?.replace(/\s/g, '') ?? '0'
    )
    const penaltiesAndInterest = parseInt(
      this.TotalPenaltyInterestDue43()?.replace(/\s/g, '') ?? '0'
    )

    if (overpayment > 0 && overpayment > penaltiesAndInterest) {
      return this.formatDollarAmount(overpayment - penaltiesAndInterest)
    } else {
      return this.formatDollarAmount(0)
    }
  }

  f126 = (): string | undefined => this.OverpaymentLessPenaltyInterest45()

  /**
   * Index 127: Estimated Tax (46)
   * Portion of Line 45 appl. to open estimated tax acc
   */
  EstimatedTax46 = (): string | undefined => {
    // TODO: Validate against amount on Line 45
    return this.formatDollarAmount(
      parseInt(this.info.stateQuestions.OR_46_ESTIMATED_TAX ?? '0')
    )
  }

  f127 = (): string | undefined => this.EstimatedTax46()

  /**
   * Index 128: Charitable Checkoff Donations Schedule OR-DONATE (47)
   * Schedule OR-DONATE, Line 30
   */
  CharitableCheckoffScheduleDONATE47 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.info.stateQuestions.OR_47_CHARITABLE_CHECKOFF_DONATIONS ?? '0'
      )
    )
  }

  f128 = (): string | undefined => this.CharitableCheckoffScheduleDONATE47()

  /**
   * Index 129: Political Party $3 Checkoff (48)
   */
  PoliticalPartyCheckoff48 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.info.stateQuestions.OR_48_POLITICAL_PARTY_3DOLLAR_CHECKOFF ?? '0'
      )
    )
  }

  f129 = (): string | undefined => this.PoliticalPartyCheckoff48()

  /**
   * Index 130: Oregon 529 College Savings Plan Deposits Schedule OR-529 (49)
   */
  CollegeSavingsPlanDepositSchedule52949 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.info.stateQuestions.OR_49_529_COLLEGE_SAVINGS_PLAN_DEPOSITS ?? '0'
      )
    )
  }

  f130 = (): string | undefined => this.CollegeSavingsPlanDepositSchedule52949()

  /**
   * Index 131: Total (50)
   * Add Lines 46 - 49, Line 50 <= Line 45
   */
  TotalTax50 = (): string | undefined => {
    const total =
      parseInt(this.EstimatedTax46()?.replace(/\s/g, '') ?? '0') +
      parseInt(
        this.CharitableCheckoffScheduleDONATE47()?.replace(/\s/g, '') ?? '0'
      ) +
      parseInt(this.PoliticalPartyCheckoff48()?.replace(/\s/g, '') ?? '0') +
      parseInt(
        this.CollegeSavingsPlanDepositSchedule52949()?.replace(/\s/g, '') ?? '0'
      )
    const refund = parseInt(
      this.OverpaymentLessPenaltyInterest45()?.replace(/\s/g, '') ?? '0'
    )

    if (total > refund) {
      return this.formatDollarAmount(refund)
    } else {
      return this.formatDollarAmount(total)
    }
  }

  f131 = (): string | undefined => this.TotalTax50()

  /**
   * Index 132: Kicker Donation (53b)
   */
  KickerDonation53b = (): string | undefined => {
    if (this.KickerToStateSchoolFund53a() === true) {
      return this.formatDollarAmount(
        parseInt(
          this.info.stateQuestions.OR_36_53_KICKER_OREGON_SURPLUS_CREDIT ?? '0'
        )
      )
    } else {
      return '0'
    }
  }

  f132 = (): string | undefined => this.KickerDonation53b()

  /**
   * Index 133: Net Refund (51)
   * Line 45 - Line 50
   */
  NetRefund51 = (): string | undefined => {
    return this.formatDollarAmount(
      parseInt(
        this.OverpaymentLessPenaltyInterest45()?.replace(/\s/g, '') ?? '0'
      ) - parseInt(this.TotalTax50()?.replace(/\s/g, '') ?? '0')
    )
  }

  f133 = (): string | undefined => this.NetRefund51()

  /**
   * Index 134: Filing Status (1, 2, 3, 4, 5)
   * Format: Choice1, Choice2, Choice3, Choice4, Choice5
   */
  FilingStatus12345 = (): string | undefined => {
    let filingStatus: string | undefined
    switch (this.info.taxPayer.filingStatus) {
      case FilingStatus.S:
        filingStatus = 'Choice1'
        break
      case FilingStatus.MFJ:
        filingStatus = 'Choice2'
        break
      case FilingStatus.MFS:
        filingStatus = 'Choice3'
        break
      case FilingStatus.HOH:
        filingStatus = 'Choice4'
        break
      case FilingStatus.W:
        filingStatus = 'Choice5'
        break
      default:
        break
    }
    return filingStatus
  }

  f134 = (): string | undefined => this.FilingStatus12345()

  /**
   * Index 135: Tax Payer's State
   */
  TaxPayerState = (): string | undefined => {
    return undefined
  }

  f135 = (): string | undefined => this.TaxPayerState()

  /**
   * Index 136: Dependent 1 Code
   */
  Dependent1Code = (): string | undefined => {
    //TODO: Dependent.relationship should return relationship code (see OR-40-FY)
    return this.info.taxPayer.dependents[0]?.relationship.slice(0, 2)
  }

  f136 = (): string | undefined => this.Dependent1Code()

  /**
   * Index 137: Dependent 2 Code
   */
  Dependent2Code = (): string | undefined => {
    return this.info.taxPayer.dependents[1]?.relationship.slice(0, 2)
  }

  f137 = (): string | undefined => this.Dependent2Code()

  /**
   * Index 138: Dependent 3 Code
   */
  Dependent3Code = (): string | undefined => {
    return this.info.taxPayer.dependents[2]?.relationship.slice(0, 2)
  }

  f138 = (): string | undefined => this.Dependent3Code()

  /**
   * Index 139: Checking Or Savings (52)
   * format: Choice1, Choice2
   */
  CheckingOrSavings52 = (): string | undefined => {
    return this.info.refund?.accountType === AccountType.checking
      ? 'Choice1'
      : 'Choice2'
  }

  f139 = (): string | undefined => this.CheckingOrSavings52()

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

  // 134, 139 -> radio button idx's
}

const makeOR40 = (f1040: F1040): OR40 => new OR40(f1040)

export default makeOR40
