import Form from '../Form'
import F1040 from '../../irsForms/F1040'
import { Field } from '../../pdfFiller'
import { displayNumber, sumFields } from '../../irsForms/util'
import { AccountType, FilingStatus, Information, State } from '../../redux/data'

export class il1040scheduleileeic implements Form {
  info: Information
  f1040: F1040
  formName: string
  state: State

  constructor(info: Information, f1040: F1040) {
    this.info = info
    this.f1040 = f1040
    this.formName = 'il-1040-schedule-il-e-eic'
    this.state = 'IL'
  }

  /**
   * Index 0: Help
   */
  Help = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.Help()

  /**
   * Index 1: X  2325
   */
  X2325 = (): string | undefined => {
    return undefined
  }

  f1 = (): string | undefined => this.X2325()

  /**
   * Index 2: Reset
   */
  Reset = (): string | undefined => {
    return undefined
  }

  f2 = (): string | undefined => this.Reset()

  /**
   * Index 3: Print
   */
  Print = (): string | undefined => {
    return undefined
  }

  f3 = (): string | undefined => this.Print()

  /**
   * Index 4: Your name
   */
  Yourname = (): string | undefined =>
    `${this.info.taxPayer.primaryPerson?.firstName} ${this.info.taxPayer.primaryPerson?.lastName}`

  f4 = (): string | undefined => this.Yourname()

  /**
   * Index 5: Dependents first name - 2
   */
  Dependentsfirstname2 = (): string | undefined => {
    return undefined
  }

  f5 = (): string | undefined => this.Dependentsfirstname2()

  /**
   * Index 6: Dependent's first name - 1
   */
  Dependentsfirstname1 = (): string | undefined => {
    return undefined
  }

  f6 = (): string | undefined => this.Dependentsfirstname1()

  /**
   * Index 7: Dependent's first name - 3
   */
  Dependentsfirstname3 = (): string | undefined => {
    return undefined
  }

  f7 = (): string | undefined => this.Dependentsfirstname3()

  /**
   * Index 8: Dependent's first name - 4
   */
  Dependentsfirstname4 = (): string | undefined => {
    return undefined
  }

  f8 = (): string | undefined => this.Dependentsfirstname4()

  /**
   * Index 9: Dependent's first name - 5
   */
  Dependentsfirstname5 = (): string | undefined => {
    return undefined
  }

  f9 = (): string | undefined => this.Dependentsfirstname5()

  /**
   * Index 10: Dependent's first name - 6
   */
  Dependentsfirstname6 = (): string | undefined => {
    return undefined
  }

  f10 = (): string | undefined => this.Dependentsfirstname6()

  /**
   * Index 11: Dependent's first name - 7
   */
  Dependentsfirstname7 = (): string | undefined => {
    return undefined
  }

  f11 = (): string | undefined => this.Dependentsfirstname7()

  /**
   * Index 12: Dependent's first name - 8
   */
  Dependentsfirstname8 = (): string | undefined => {
    return undefined
  }

  f12 = (): string | undefined => this.Dependentsfirstname8()

  /**
   * Index 13: Dependent's first name - 9
   */
  Dependentsfirstname9 = (): string | undefined => {
    return undefined
  }

  f13 = (): string | undefined => this.Dependentsfirstname9()

  /**
   * Index 14: Dependent's first name - 10
   */
  Dependentsfirstname10 = (): string | undefined => {
    return undefined
  }

  f14 = (): string | undefined => this.Dependentsfirstname10()

  /**
   * Index 15: Dependent's last name - 2
   */
  Dependentslastname2 = (): string | undefined => {
    return undefined
  }

  f15 = (): string | undefined => this.Dependentslastname2()

  /**
   * Index 16: Dependent's last name - 1
   */
  Dependentslastname1 = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.Dependentslastname1()

  /**
   * Index 17: Dependent's last name - 3
   */
  Dependentslastname3 = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.Dependentslastname3()

  /**
   * Index 18: Dependent's last name - 4
   */
  Dependentslastname4 = (): string | undefined => {
    return undefined
  }

  f18 = (): string | undefined => this.Dependentslastname4()

  /**
   * Index 19: Dependent's last name - 5
   */
  Dependentslastname5 = (): string | undefined => {
    return undefined
  }

  f19 = (): string | undefined => this.Dependentslastname5()

  /**
   * Index 20: Dependent's last name - 6
   */
  Dependentslastname6 = (): string | undefined => {
    return undefined
  }

  f20 = (): string | undefined => this.Dependentslastname6()

  /**
   * Index 21: Dependent's last name - 7
   */
  Dependentslastname7 = (): string | undefined => {
    return undefined
  }

  f21 = (): string | undefined => this.Dependentslastname7()

  /**
   * Index 22: Dependent's last name - 8
   */
  Dependentslastname8 = (): string | undefined => {
    return undefined
  }

  f22 = (): string | undefined => this.Dependentslastname8()

  /**
   * Index 23: Dependent's last name - 9
   */
  Dependentslastname9 = (): string | undefined => {
    return undefined
  }

  f23 = (): string | undefined => this.Dependentslastname9()

  /**
   * Index 24: Dependent's last name - 10
   */
  Dependentslastname10 = (): string | undefined => {
    return undefined
  }

  f24 = (): string | undefined => this.Dependentslastname10()

  /**
   * Index 25: Social Security number - 2
   */
  SocialSecuritynumber2 = (): string | undefined => {
    return undefined
  }

  f25 = (): string | undefined => this.SocialSecuritynumber2()

  /**
   * Index 26: Social Security number - 3
   */
  SocialSecuritynumber3 = (): string | undefined => {
    return undefined
  }

  f26 = (): string | undefined => this.SocialSecuritynumber3()

  /**
   * Index 27: Social Security number - 4
   */
  SocialSecuritynumber4 = (): string | undefined => {
    return undefined
  }

  f27 = (): string | undefined => this.SocialSecuritynumber4()

  /**
   * Index 28: Social Security number - 5
   */
  SocialSecuritynumber5 = (): string | undefined => {
    return undefined
  }

  f28 = (): string | undefined => this.SocialSecuritynumber5()

  /**
   * Index 29: Social Security number - 6
   */
  SocialSecuritynumber6 = (): string | undefined => {
    return undefined
  }

  f29 = (): string | undefined => this.SocialSecuritynumber6()

  /**
   * Index 30: Social Security number - 7
   */
  SocialSecuritynumber7 = (): string | undefined => {
    return undefined
  }

  f30 = (): string | undefined => this.SocialSecuritynumber7()

  /**
   * Index 31: Social Security number - 8
   */
  SocialSecuritynumber8 = (): string | undefined => {
    return undefined
  }

  f31 = (): string | undefined => this.SocialSecuritynumber8()

  /**
   * Index 32: Social Security number - 9
   */
  SocialSecuritynumber9 = (): string | undefined => {
    return undefined
  }

  f32 = (): string | undefined => this.SocialSecuritynumber9()

  /**
   * Index 33: Social Security number - 10
   */
  SocialSecuritynumber10 = (): string | undefined => {
    return undefined
  }

  f33 = (): string | undefined => this.SocialSecuritynumber10()

  /**
   * Index 34: Dependent's relationship to you - 1
   */
  Dependentsrelationshiptoyou1 = (): string | undefined => {
    return undefined
  }

  f34 = (): string | undefined => this.Dependentsrelationshiptoyou1()

  /**
   * Index 35: Dependent's relationship to you - 2
   */
  Dependentsrelationshiptoyou2 = (): string | undefined => {
    return undefined
  }

  f35 = (): string | undefined => this.Dependentsrelationshiptoyou2()

  /**
   * Index 36: Dependent's relationship to you - 3
   */
  Dependentsrelationshiptoyou3 = (): string | undefined => {
    return undefined
  }

  f36 = (): string | undefined => this.Dependentsrelationshiptoyou3()

  /**
   * Index 37: Dependent's relationship to you - 4
   */
  Dependentsrelationshiptoyou4 = (): string | undefined => {
    return undefined
  }

  f37 = (): string | undefined => this.Dependentsrelationshiptoyou4()

  /**
   * Index 38: Dependent's relationship to you - 5
   */
  Dependentsrelationshiptoyou5 = (): string | undefined => {
    return undefined
  }

  f38 = (): string | undefined => this.Dependentsrelationshiptoyou5()

  /**
   * Index 39: Dependent's relationship to you - 6
   */
  Dependentsrelationshiptoyou6 = (): string | undefined => {
    return undefined
  }

  f39 = (): string | undefined => this.Dependentsrelationshiptoyou6()

  /**
   * Index 40: Dependent's relationship to you - 7
   */
  Dependentsrelationshiptoyou7 = (): string | undefined => {
    return undefined
  }

  f40 = (): string | undefined => this.Dependentsrelationshiptoyou7()

  /**
   * Index 41: Dependent's relationship to you - 8
   */
  Dependentsrelationshiptoyou8 = (): string | undefined => {
    return undefined
  }

  f41 = (): string | undefined => this.Dependentsrelationshiptoyou8()

  /**
   * Index 42: Dependent's relationship to you - 9
   */
  Dependentsrelationshiptoyou9 = (): string | undefined => {
    return undefined
  }

  f42 = (): string | undefined => this.Dependentsrelationshiptoyou9()

  /**
   * Index 43: Dependent's relationship to you - 10
   */
  Dependentsrelationshiptoyou10 = (): string | undefined => {
    return undefined
  }

  f43 = (): string | undefined => this.Dependentsrelationshiptoyou10()

  /**
   * Index 44: Dependent's date of birth (mm/dd/yyyy) - 1
   */
  Dependentsdateofbirthmmddyyyy1 = (): string | undefined => {
    return undefined
  }

  f44 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy1()

  /**
   * Index 45: Dependent's date of birth (mm/dd/yyyy) - 2
   */
  Dependentsdateofbirthmmddyyyy2 = (): string | undefined => {
    return undefined
  }

  f45 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy2()

  /**
   * Index 46: Dependent's date of birth (mm/dd/yyyy) - 3
   */
  Dependentsdateofbirthmmddyyyy3 = (): string | undefined => {
    return undefined
  }

  f46 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy3()

  /**
   * Index 47: Dependent's date of birth (mm/dd/yyyy) - 4
   */
  Dependentsdateofbirthmmddyyyy4 = (): string | undefined => {
    return undefined
  }

  f47 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy4()

  /**
   * Index 48: Dependent's date of birth (mm/dd/yyyy) - 5
   */
  Dependentsdateofbirthmmddyyyy5 = (): string | undefined => {
    return undefined
  }

  f48 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy5()

  /**
   * Index 49: Dependent's date of birth (mm/dd/yyyy) - 6
   */
  Dependentsdateofbirthmmddyyyy6 = (): string | undefined => {
    return undefined
  }

  f49 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy6()

  /**
   * Index 50: Dependent's date of birth (mm/dd/yyyy) - 7
   */
  Dependentsdateofbirthmmddyyyy7 = (): string | undefined => {
    return undefined
  }

  f50 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy7()

  /**
   * Index 51: Dependent's date of birth (mm/dd/yyyy) - 8
   */
  Dependentsdateofbirthmmddyyyy8 = (): string | undefined => {
    return undefined
  }

  f51 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy8()

  /**
   * Index 52: Dependent's date of birth (mm/dd/yyyy) - 9
   */
  Dependentsdateofbirthmmddyyyy9 = (): string | undefined => {
    return undefined
  }

  f52 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy9()

  /**
   * Index 53: Dependent's date of birth (mm/dd/yyyy) - 10
   */
  Dependentsdateofbirthmmddyyyy10 = (): string | undefined => {
    return undefined
  }

  f53 = (): string | undefined => this.Dependentsdateofbirthmmddyyyy10()

  /**
   * Index 54: Full Time Student - 1
   */
  FullTimeStudent1 = (): boolean | undefined => {
    return undefined
  }

  f54 = (): boolean | undefined => this.FullTimeStudent1()

  /**
   * Index 55: Full Time Student - 2
   */
  FullTimeStudent2 = (): boolean | undefined => {
    return undefined
  }

  f55 = (): boolean | undefined => this.FullTimeStudent2()

  /**
   * Index 56: Full Time Student - 3
   */
  FullTimeStudent3 = (): boolean | undefined => {
    return undefined
  }

  f56 = (): boolean | undefined => this.FullTimeStudent3()

  /**
   * Index 57: Full Time Student - 4
   */
  FullTimeStudent4 = (): boolean | undefined => {
    return undefined
  }

  f57 = (): boolean | undefined => this.FullTimeStudent4()

  /**
   * Index 58: Full Time Student - 5
   */
  FullTimeStudent5 = (): boolean | undefined => {
    return undefined
  }

  f58 = (): boolean | undefined => this.FullTimeStudent5()

  /**
   * Index 59: Full Time Student - 6
   */
  FullTimeStudent6 = (): boolean | undefined => {
    return undefined
  }

  f59 = (): boolean | undefined => this.FullTimeStudent6()

  /**
   * Index 60: Full Time Student - 7
   */
  FullTimeStudent7 = (): boolean | undefined => {
    return undefined
  }

  f60 = (): boolean | undefined => this.FullTimeStudent7()

  /**
   * Index 61: Full Time Student - 8
   */
  FullTimeStudent8 = (): boolean | undefined => {
    return undefined
  }

  f61 = (): boolean | undefined => this.FullTimeStudent8()

  /**
   * Index 62: Full Time Student - 9
   */
  FullTimeStudent9 = (): boolean | undefined => {
    return undefined
  }

  f62 = (): boolean | undefined => this.FullTimeStudent9()

  /**
   * Index 63: Full Time Student - 10
   */
  FullTimeStudent10 = (): boolean | undefined => {
    return undefined
  }

  f63 = (): boolean | undefined => this.FullTimeStudent10()

  /**
   * Index 64: Person with disability - 1
   */
  Personwithdisability1 = (): boolean | undefined => {
    return undefined
  }

  f64 = (): boolean | undefined => this.Personwithdisability1()

  /**
   * Index 65: Person with disability - 2
   */
  Personwithdisability2 = (): boolean | undefined => {
    return undefined
  }

  f65 = (): boolean | undefined => this.Personwithdisability2()

  /**
   * Index 66: Person with disability - 3
   */
  Personwithdisability3 = (): boolean | undefined => {
    return undefined
  }

  f66 = (): boolean | undefined => this.Personwithdisability3()

  /**
   * Index 67: Person with disability - 4
   */
  Personwithdisability4 = (): boolean | undefined => {
    return undefined
  }

  f67 = (): boolean | undefined => this.Personwithdisability4()

  /**
   * Index 68: Person with disability - 5
   */
  Personwithdisability5 = (): boolean | undefined => {
    return undefined
  }

  f68 = (): boolean | undefined => this.Personwithdisability5()

  /**
   * Index 69: Person with disability - 6
   */
  Personwithdisability6 = (): boolean | undefined => {
    return undefined
  }

  f69 = (): boolean | undefined => this.Personwithdisability6()

  /**
   * Index 70: Person with disability - 7
   */
  Personwithdisability7 = (): boolean | undefined => {
    return undefined
  }

  f70 = (): boolean | undefined => this.Personwithdisability7()

  /**
   * Index 71: Person with disability - 8
   */
  Personwithdisability8 = (): boolean | undefined => {
    return undefined
  }

  f71 = (): boolean | undefined => this.Personwithdisability8()

  /**
   * Index 72: Person with disability - 9
   */
  Personwithdisability9 = (): boolean | undefined => {
    return undefined
  }

  f72 = (): boolean | undefined => this.Personwithdisability9()

  /**
   * Index 73: Person with disability - 10
   */
  Personwithdisability10 = (): boolean | undefined => {
    return undefined
  }

  f73 = (): boolean | undefined => this.Personwithdisability10()

  /**
   * Index 74: Number of months living with you - 1
   */
  Numberofmonthslivingwithyou1 = (): string | undefined => {
    return undefined
  }

  f74 = (): string | undefined => this.Numberofmonthslivingwithyou1()

  /**
   * Index 75: Number of months living with you - 2
   */
  Numberofmonthslivingwithyou2 = (): string | undefined => {
    return undefined
  }

  f75 = (): string | undefined => this.Numberofmonthslivingwithyou2()

  /**
   * Index 76: Number of months living with you - 3
   */
  Numberofmonthslivingwithyou3 = (): string | undefined => {
    return undefined
  }

  f76 = (): string | undefined => this.Numberofmonthslivingwithyou3()

  /**
   * Index 77: Number of months living with you - 4
   */
  Numberofmonthslivingwithyou4 = (): string | undefined => {
    return undefined
  }

  f77 = (): string | undefined => this.Numberofmonthslivingwithyou4()

  /**
   * Index 78: Number of months living with you - 5
   */
  Numberofmonthslivingwithyou5 = (): string | undefined => {
    return undefined
  }

  f78 = (): string | undefined => this.Numberofmonthslivingwithyou5()

  /**
   * Index 79: Number of months living with you - 6
   */
  Numberofmonthslivingwithyou6 = (): string | undefined => {
    return undefined
  }

  f79 = (): string | undefined => this.Numberofmonthslivingwithyou6()

  /**
   * Index 80: Number of months living with you - 7
   */
  Numberofmonthslivingwithyou7 = (): string | undefined => {
    return undefined
  }

  f80 = (): string | undefined => this.Numberofmonthslivingwithyou7()

  /**
   * Index 81: Number of months living with you - 8
   */
  Numberofmonthslivingwithyou8 = (): string | undefined => {
    return undefined
  }

  f81 = (): string | undefined => this.Numberofmonthslivingwithyou8()

  /**
   * Index 82: Number of months living with you - 9
   */
  Numberofmonthslivingwithyou9 = (): string | undefined => {
    return undefined
  }

  f82 = (): string | undefined => this.Numberofmonthslivingwithyou9()

  /**
   * Index 83: Number of months living with you - 10
   */
  Numberofmonthslivingwithyou10 = (): string | undefined => {
    return undefined
  }

  f83 = (): string | undefined => this.Numberofmonthslivingwithyou10()

  /**
   * Index 84: Eligible for Earned Income Credit - 1
   */
  EligibleforEarnedIncomeCredit1 = (): boolean | undefined => {
    return undefined
  }

  f84 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit1()

  /**
   * Index 85: Eligible for Earned Income Credit - 2
   */
  EligibleforEarnedIncomeCredit2 = (): boolean | undefined => {
    return undefined
  }

  f85 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit2()

  /**
   * Index 86: Eligible for Earned Income Credit - 3
   */
  EligibleforEarnedIncomeCredit3 = (): boolean | undefined => {
    return undefined
  }

  f86 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit3()

  /**
   * Index 87: Eligible for Earned Income Credit - 4
   */
  EligibleforEarnedIncomeCredit4 = (): boolean | undefined => {
    return undefined
  }

  f87 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit4()

  /**
   * Index 88: Eligible for Earned Income Credit - 5
   */
  EligibleforEarnedIncomeCredit5 = (): boolean | undefined => {
    return undefined
  }

  f88 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit5()

  /**
   * Index 89: Eligible for Earned Income Credit - 6
   */
  EligibleforEarnedIncomeCredit6 = (): boolean | undefined => {
    return undefined
  }

  f89 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit6()

  /**
   * Index 90: Eligible for Earned Income Credit - 7
   */
  EligibleforEarnedIncomeCredit7 = (): boolean | undefined => {
    return undefined
  }

  f90 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit7()

  /**
   * Index 91: Eligible for Earned Income Credit - 8
   */
  EligibleforEarnedIncomeCredit8 = (): boolean | undefined => {
    return undefined
  }

  f91 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit8()

  /**
   * Index 92: Eligible for Earned Income Credit - 9
   */
  EligibleforEarnedIncomeCredit9 = (): boolean | undefined => {
    return undefined
  }

  f92 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit9()

  /**
   * Index 93: Eligible for Earned Income Credit - 10
   */
  EligibleforEarnedIncomeCredit10 = (): boolean | undefined => {
    return undefined
  }

  f93 = (): boolean | undefined => this.EligibleforEarnedIncomeCredit10()

  /**
   * Index 94: Mutiplied total number of dependents
   */
  Mutipliedtotalnumberofdependents = (): string | undefined => {
    return undefined
  }

  f94 = (): string | undefined => this.Mutipliedtotalnumberofdependents()

  /**
   * Index 95: Child's first name -1
   */
  Childsfirstname1 = (): string | undefined => {
    return undefined
  }

  f95 = (): string | undefined => this.Childsfirstname1()

  /**
   * Index 96: Child's first name -2
   */
  Childsfirstname2 = (): string | undefined => {
    return undefined
  }

  f96 = (): string | undefined => this.Childsfirstname2()

  /**
   * Index 97: Child's first name -3
   */
  Childsfirstname3 = (): string | undefined => {
    return undefined
  }

  f97 = (): string | undefined => this.Childsfirstname3()

  /**
   * Index 98: Child's first name - 4
   */
  Childsfirstname4 = (): string | undefined => {
    return undefined
  }

  f98 = (): string | undefined => this.Childsfirstname4()

  /**
   * Index 99: Child's first name - 5
   */
  Childsfirstname5 = (): string | undefined => {
    return undefined
  }

  f99 = (): string | undefined => this.Childsfirstname5()

  /**
   * Index 100: Child's first name - 6
   */
  Childsfirstname6 = (): string | undefined => {
    return undefined
  }

  f100 = (): string | undefined => this.Childsfirstname6()

  /**
   * Index 101: Child's first name - 7
   */
  Childsfirstname7 = (): string | undefined => {
    return undefined
  }

  f101 = (): string | undefined => this.Childsfirstname7()

  /**
   * Index 102: Child's first name - 8
   */
  Childsfirstname8 = (): string | undefined => {
    return undefined
  }

  f102 = (): string | undefined => this.Childsfirstname8()

  /**
   * Index 103: Child's last name - 1
   */
  Childslastname1 = (): string | undefined => {
    return undefined
  }

  f103 = (): string | undefined => this.Childslastname1()

  /**
   * Index 104: Child's last name - 2
   */
  Childslastname2 = (): string | undefined => {
    return undefined
  }

  f104 = (): string | undefined => this.Childslastname2()

  /**
   * Index 105: Child's last name - 3
   */
  Childslastname3 = (): string | undefined => {
    return undefined
  }

  f105 = (): string | undefined => this.Childslastname3()

  /**
   * Index 106: Child's last name - 4
   */
  Childslastname4 = (): string | undefined => {
    return undefined
  }

  f106 = (): string | undefined => this.Childslastname4()

  /**
   * Index 107: Child's last name - 5
   */
  Childslastname5 = (): string | undefined => {
    return undefined
  }

  f107 = (): string | undefined => this.Childslastname5()

  /**
   * Index 108: Child's last name - 6
   */
  Childslastname6 = (): string | undefined => {
    return undefined
  }

  f108 = (): string | undefined => this.Childslastname6()

  /**
   * Index 109: Child's last name - 7
   */
  Childslastname7 = (): string | undefined => {
    return undefined
  }

  f109 = (): string | undefined => this.Childslastname7()

  /**
   * Index 110: Child's last name - 8
   */
  Childslastname8 = (): string | undefined => {
    return undefined
  }

  f110 = (): string | undefined => this.Childslastname8()

  /**
   * Index 111: Social Security number - 1
   */
  SocialSecuritynumber1 = (): string | undefined => {
    return undefined
  }

  f111 = (): string | undefined => this.SocialSecuritynumber1()

  /**
   * Index 112: Child's Social Security number - 1
   */
  ChildsSocialSecuritynumber1 = (): string | undefined => {
    return undefined
  }

  f112 = (): string | undefined => this.ChildsSocialSecuritynumber1()

  /**
   * Index 113: Child's Social Security number - 2
   */
  ChildsSocialSecuritynumber2 = (): string | undefined => {
    return undefined
  }

  f113 = (): string | undefined => this.ChildsSocialSecuritynumber2()

  /**
   * Index 114: Child's Social Security number - 3
   */
  ChildsSocialSecuritynumber3 = (): string | undefined => {
    return undefined
  }

  f114 = (): string | undefined => this.ChildsSocialSecuritynumber3()

  /**
   * Index 115: Child's Social Security number - 4
   */
  ChildsSocialSecuritynumber4 = (): string | undefined => {
    return undefined
  }

  f115 = (): string | undefined => this.ChildsSocialSecuritynumber4()

  /**
   * Index 116: Child's Social Security number - 5
   */
  ChildsSocialSecuritynumber5 = (): string | undefined => {
    return undefined
  }

  f116 = (): string | undefined => this.ChildsSocialSecuritynumber5()

  /**
   * Index 117: Child's Social Security number - 6
   */
  ChildsSocialSecuritynumber6 = (): string | undefined => {
    return undefined
  }

  f117 = (): string | undefined => this.ChildsSocialSecuritynumber6()

  /**
   * Index 118: Child's Social Security number - 7
   */
  ChildsSocialSecuritynumber7 = (): string | undefined => {
    return undefined
  }

  f118 = (): string | undefined => this.ChildsSocialSecuritynumber7()

  /**
   * Index 119: Child's Social Security number - 8
   */
  ChildsSocialSecuritynumber8 = (): string | undefined => {
    return undefined
  }

  f119 = (): string | undefined => this.ChildsSocialSecuritynumber8()

  /**
   * Index 120: Child's relationship to you - 1
   */
  Childsrelationshiptoyou1 = (): string | undefined => {
    return undefined
  }

  f120 = (): string | undefined => this.Childsrelationshiptoyou1()

  /**
   * Index 121: Child's relationship to you - 2
   */
  Childsrelationshiptoyou2 = (): string | undefined => {
    return undefined
  }

  f121 = (): string | undefined => this.Childsrelationshiptoyou2()

  /**
   * Index 122: Child's relationship to you - 3
   */
  Childsrelationshiptoyou3 = (): string | undefined => {
    return undefined
  }

  f122 = (): string | undefined => this.Childsrelationshiptoyou3()

  /**
   * Index 123: Child's relationship to you - 4
   */
  Childsrelationshiptoyou4 = (): string | undefined => {
    return undefined
  }

  f123 = (): string | undefined => this.Childsrelationshiptoyou4()

  /**
   * Index 124: Child's relationship to you - 5
   */
  Childsrelationshiptoyou5 = (): string | undefined => {
    return undefined
  }

  f124 = (): string | undefined => this.Childsrelationshiptoyou5()

  /**
   * Index 125: Child's relationship to you - 6
   */
  Childsrelationshiptoyou6 = (): string | undefined => {
    return undefined
  }

  f125 = (): string | undefined => this.Childsrelationshiptoyou6()

  /**
   * Index 126: Child's relationship to you - 7
   */
  Childsrelationshiptoyou7 = (): string | undefined => {
    return undefined
  }

  f126 = (): string | undefined => this.Childsrelationshiptoyou7()

  /**
   * Index 127: Child's relationship to you - 8
   */
  Childsrelationshiptoyou8 = (): string | undefined => {
    return undefined
  }

  f127 = (): string | undefined => this.Childsrelationshiptoyou8()

  /**
   * Index 128: Child's date of birth (mm/dd/yyyy) - 1
   */
  Childsdateofbirthmmddyyyy1 = (): string | undefined => {
    return undefined
  }

  f128 = (): string | undefined => this.Childsdateofbirthmmddyyyy1()

  /**
   * Index 129: Child's date of birth (mm/dd/yyyy) - 2
   */
  Childsdateofbirthmmddyyyy2 = (): string | undefined => {
    return undefined
  }

  f129 = (): string | undefined => this.Childsdateofbirthmmddyyyy2()

  /**
   * Index 130: Child's date of birth (mm/dd/yyyy) - 3
   */
  Childsdateofbirthmmddyyyy3 = (): string | undefined => {
    return undefined
  }

  f130 = (): string | undefined => this.Childsdateofbirthmmddyyyy3()

  /**
   * Index 131: Child's date of birth (mm/dd/yyyy) - 4
   */
  Childsdateofbirthmmddyyyy4 = (): string | undefined => {
    return undefined
  }

  f131 = (): string | undefined => this.Childsdateofbirthmmddyyyy4()

  /**
   * Index 132: Child's date of birth (mm/dd/yyyy) - 5
   */
  Childsdateofbirthmmddyyyy5 = (): string | undefined => {
    return undefined
  }

  f132 = (): string | undefined => this.Childsdateofbirthmmddyyyy5()

  /**
   * Index 133: Child's date of birth (mm/dd/yyyy) - 6
   */
  Childsdateofbirthmmddyyyy6 = (): string | undefined => {
    return undefined
  }

  f133 = (): string | undefined => this.Childsdateofbirthmmddyyyy6()

  /**
   * Index 134: Child's date of birth (mm/dd/yyyy) - 7
   */
  Childsdateofbirthmmddyyyy7 = (): string | undefined => {
    return undefined
  }

  f134 = (): string | undefined => this.Childsdateofbirthmmddyyyy7()

  /**
   * Index 135: Child's date of birth (mm/dd/yyyy) - 8
   */
  Childsdateofbirthmmddyyyy8 = (): string | undefined => {
    return undefined
  }

  f135 = (): string | undefined => this.Childsdateofbirthmmddyyyy8()

  /**
   * Index 136: Child - Full Time Student - 1
   */
  ChildFullTimeStudent1 = (): boolean | undefined => {
    return undefined
  }

  f136 = (): boolean | undefined => this.ChildFullTimeStudent1()

  /**
   * Index 137: Child - Full Time Student - 2
   */
  ChildFullTimeStudent2 = (): boolean | undefined => {
    return undefined
  }

  f137 = (): boolean | undefined => this.ChildFullTimeStudent2()

  /**
   * Index 138: Child - Full Time Student - 3
   */
  ChildFullTimeStudent3 = (): boolean | undefined => {
    return undefined
  }

  f138 = (): boolean | undefined => this.ChildFullTimeStudent3()

  /**
   * Index 139: Child - Full Time Student - 4
   */
  ChildFullTimeStudent4 = (): boolean | undefined => {
    return undefined
  }

  f139 = (): boolean | undefined => this.ChildFullTimeStudent4()

  /**
   * Index 140: Child - Full Time Student - 5
   */
  ChildFullTimeStudent5 = (): boolean | undefined => {
    return undefined
  }

  f140 = (): boolean | undefined => this.ChildFullTimeStudent5()

  /**
   * Index 141: Child - Full Time Student - 6
   */
  ChildFullTimeStudent6 = (): boolean | undefined => {
    return undefined
  }

  f141 = (): boolean | undefined => this.ChildFullTimeStudent6()

  /**
   * Index 142: Child - Full Time Student - 7
   */
  ChildFullTimeStudent7 = (): boolean | undefined => {
    return undefined
  }

  f142 = (): boolean | undefined => this.ChildFullTimeStudent7()

  /**
   * Index 143: Child - Full Time Student - 8
   */
  ChildFullTimeStudent8 = (): boolean | undefined => {
    return undefined
  }

  f143 = (): boolean | undefined => this.ChildFullTimeStudent8()

  /**
   * Index 144: Child - Person with disability - 2
   */
  ChildPersonwithdisability2 = (): boolean | undefined => {
    return undefined
  }

  f144 = (): boolean | undefined => this.ChildPersonwithdisability2()

  /**
   * Index 145: Child - Person with disability - 1
   */
  ChildPersonwithdisability1 = (): boolean | undefined => {
    return undefined
  }

  f145 = (): boolean | undefined => this.ChildPersonwithdisability1()

  /**
   * Index 146: Child - Person with disability - 3
   */
  ChildPersonwithdisability3 = (): boolean | undefined => {
    return undefined
  }

  f146 = (): boolean | undefined => this.ChildPersonwithdisability3()

  /**
   * Index 147: Child - Person with disability - 4
   */
  ChildPersonwithdisability4 = (): boolean | undefined => {
    return undefined
  }

  f147 = (): boolean | undefined => this.ChildPersonwithdisability4()

  /**
   * Index 148: Child - Person with disability - 5
   */
  ChildPersonwithdisability5 = (): boolean | undefined => {
    return undefined
  }

  f148 = (): boolean | undefined => this.ChildPersonwithdisability5()

  /**
   * Index 149: Child - Person with disability - 6
   */
  ChildPersonwithdisability6 = (): boolean | undefined => {
    return undefined
  }

  f149 = (): boolean | undefined => this.ChildPersonwithdisability6()

  /**
   * Index 150: Child - Person with disability - 7
   */
  ChildPersonwithdisability7 = (): boolean | undefined => {
    return undefined
  }

  f150 = (): boolean | undefined => this.ChildPersonwithdisability7()

  /**
   * Index 151: Child - Person with disability - 8
   */
  ChildPersonwithdisability8 = (): boolean | undefined => {
    return undefined
  }

  f151 = (): boolean | undefined => this.ChildPersonwithdisability8()

  /**
   * Index 152: Child - Number of months living with you - 1
   */
  ChildNumberofmonthslivingwithyou1 = (): string | undefined => {
    return undefined
  }

  f152 = (): string | undefined => this.ChildNumberofmonthslivingwithyou1()

  /**
   * Index 153: Child - Number of months living with you - 2
   */
  ChildNumberofmonthslivingwithyou2 = (): string | undefined => {
    return undefined
  }

  f153 = (): string | undefined => this.ChildNumberofmonthslivingwithyou2()

  /**
   * Index 154: Child - Number of months living with you - 3
   */
  ChildNumberofmonthslivingwithyou3 = (): string | undefined => {
    return undefined
  }

  f154 = (): string | undefined => this.ChildNumberofmonthslivingwithyou3()

  /**
   * Index 155: Child - Number of months living with you - 4
   */
  ChildNumberofmonthslivingwithyou4 = (): string | undefined => {
    return undefined
  }

  f155 = (): string | undefined => this.ChildNumberofmonthslivingwithyou4()

  /**
   * Index 156: Child - Number of months living with you - 5
   */
  ChildNumberofmonthslivingwithyou5 = (): string | undefined => {
    return undefined
  }

  f156 = (): string | undefined => this.ChildNumberofmonthslivingwithyou5()

  /**
   * Index 157: Child - Number of months living with you - 6
   */
  ChildNumberofmonthslivingwithyou6 = (): string | undefined => {
    return undefined
  }

  f157 = (): string | undefined => this.ChildNumberofmonthslivingwithyou6()

  /**
   * Index 158: Child - Number of months living with you - 7
   */
  ChildNumberofmonthslivingwithyou7 = (): string | undefined => {
    return undefined
  }

  f158 = (): string | undefined => this.ChildNumberofmonthslivingwithyou7()

  /**
   * Index 159: Child - Number of months living with you - 8
   */
  ChildNumberofmonthslivingwithyou8 = (): string | undefined => {
    return undefined
  }

  f159 = (): string | undefined => this.ChildNumberofmonthslivingwithyou8()

  /**
   * Index 160: Wages - Salaries - Tips
   */
  WagesSalariesTips = (): string | undefined => {
    return undefined
  }

  f160 = (): string | undefined => this.WagesSalariesTips()

  /**
   * Index 161: Business income/loss
   */
  Businessincomeloss = (): string | undefined => {
    return undefined
  }

  f161 = (): string | undefined => this.Businessincomeloss()

  /**
   * Index 162: Occupation requirement
   */
  Occupationrequirement = (): boolean | undefined => {
    return undefined
  }

  f162 = (): boolean | undefined => this.Occupationrequirement()

  /**
   * Index 163: Issuing agency - 1
   */
  Issuingagency1 = (): string | undefined => {
    return undefined
  }

  f163 = (): string | undefined => this.Issuingagency1()

  /**
   * Index 164: Issuing agency - 2
   */
  Issuingagency2 = (): string | undefined => {
    return undefined
  }

  f164 = (): string | undefined => this.Issuingagency2()

  /**
   * Index 165: Issuing agency - 3
   */
  Issuingagency3 = (): string | undefined => {
    return undefined
  }

  f165 = (): string | undefined => this.Issuingagency3()

  /**
   * Index 166: Issuing agency - 5
   */
  Issuingagency5 = (): string | undefined => {
    return undefined
  }

  f166 = (): string | undefined => this.Issuingagency5()

  /**
   * Index 167: Issuing agency - 4
   */
  Issuingagency4 = (): string | undefined => {
    return undefined
  }

  f167 = (): string | undefined => this.Issuingagency4()

  /**
   * Index 168: License/Registration/Certification - 1
   */
  LicenseRegistrationCertification1 = (): string | undefined => {
    return undefined
  }

  f168 = (): string | undefined => this.LicenseRegistrationCertification1()

  /**
   * Index 169: License/Registration/Certification - 2
   */
  LicenseRegistrationCertification2 = (): string | undefined => {
    return undefined
  }

  f169 = (): string | undefined => this.LicenseRegistrationCertification2()

  /**
   * Index 170: License/Registration/Certification - 3
   */
  LicenseRegistrationCertification3 = (): string | undefined => {
    return undefined
  }

  f170 = (): string | undefined => this.LicenseRegistrationCertification3()

  /**
   * Index 171: License/Registration/Certification - 4
   */
  LicenseRegistrationCertification4 = (): string | undefined => {
    return undefined
  }

  f171 = (): string | undefined => this.LicenseRegistrationCertification4()

  /**
   * Index 172: License/Registration/Certification - 5
   */
  LicenseRegistrationCertification5 = (): string | undefined => {
    return undefined
  }

  f172 = (): string | undefined => this.LicenseRegistrationCertification5()

  /**
   * Index 173: Filing - married filing jointly
   */
  Filingmarriedfilingjointly = (): string | undefined => {
    return undefined
  }

  f173 = (): string | undefined => this.Filingmarriedfilingjointly()

  /**
   * Index 174: Spouse' s SSN3-2
   */
  SpousesSSN32 = (): string | undefined => {
    return undefined
  }

  f174 = (): string | undefined => this.SpousesSSN32()

  /**
   * Index 175: Spouse's SSN2-2
   */
  SpousesSSN22 = (): string | undefined => {
    return undefined
  }

  f175 = (): string | undefined => this.SpousesSSN22()

  /**
   * Index 176: Spouse's SSN4-2
   */
  SpousesSSN42 = (): string | undefined => {
    return undefined
  }

  f176 = (): string | undefined => this.SpousesSSN42()

  /**
   * Index 177: Statutory employee box marked
   */
  Statutoryemployeeboxmarked = (): boolean | undefined => {
    return undefined
  }

  f177 = (): boolean | undefined => this.Statutoryemployeeboxmarked()

  /**
   * Index 178: Federal Earned Income Credit amount
   */
  FederalEarnedIncomeCreditamount = (): string | undefined => {
    return undefined
  }

  f178 = (): string | undefined => this.FederalEarnedIncomeCreditamount()

  /**
   * Index 179: Multiply L5
   */
  MultiplyL5 = (): string | undefined => {
    return undefined
  }

  f179 = (): string | undefined => this.MultiplyL5()

  /**
   * Index 180: Residents / Non-Residents rate - 1
   */
  ResidentsNonResidentsrate1 = (): string | undefined => {
    return undefined
  }

  f180 = (): string | undefined => this.ResidentsNonResidentsrate1()

  /**
   * Index 181: Residents / Non-Residents rate - 2
   */
  ResidentsNonResidentsrate2 = (): string | undefined => {
    return undefined
  }

  f181 = (): string | undefined => this.ResidentsNonResidentsrate2()

  /**
   * Index 182: Multiply L6 - L7
   */
  MultiplyL6L7 = (): string | undefined => {
    return undefined
  }

  f182 = (): string | undefined => this.MultiplyL6L7()

  /**
   * Index 183: Your SSN3
   */
  YourSSN3 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(3, 5)

  f183 = (): string | undefined => this.YourSSN3()

  /**
   * Index 184: Your SSN2
   */
  YourSSN2 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(0, 3)

  f184 = (): string | undefined => this.YourSSN2()

  /**
   * Index 185: Your SSN4
   */
  YourSSN4 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(5)

  f185 = (): string | undefined => this.YourSSN4()

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
    this.f143(),
    this.f144(),
    this.f145(),
    this.f146(),
    this.f147(),
    this.f148(),
    this.f149(),
    this.f150(),
    this.f151(),
    this.f152(),
    this.f153(),
    this.f154(),
    this.f155(),
    this.f156(),
    this.f157(),
    this.f158(),
    this.f159(),
    this.f160(),
    this.f161(),
    this.f162(),
    this.f163(),
    this.f164(),
    this.f165(),
    this.f166(),
    this.f167(),
    this.f168(),
    this.f169(),
    this.f170(),
    this.f171(),
    this.f172(),
    this.f173(),
    this.f174(),
    this.f175(),
    this.f176(),
    this.f177(),
    this.f178(),
    this.f179(),
    this.f180(),
    this.f181(),
    this.f182(),
    this.f183(),
    this.f184(),
    this.f185()
  ]
}

const makeil1040scheduleileeic = (
  info: Information,
  f1040: F1040
): il1040scheduleileeic => new il1040scheduleileeic(info, f1040)

export default makeil1040scheduleileeic
