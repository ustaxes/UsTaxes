import Form from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { IL1040 } from './IL1040'
import { Field } from 'ustaxes/core/pdfFiller'
import { Information, State } from 'ustaxes/core/data'

export default class IL1040V extends Form {
  info: Information
  f1040: F1040
  formName: string
  state: State
  il1040: IL1040
  formOrder = -1
  attachments: () => Form[] = () => []

  constructor(info: Information, f1040: F1040, il1040: IL1040) {
    super()
    this.info = info
    this.f1040 = f1040
    this.formName = 'IL-1040-V'
    this.state = 'IL'
    this.il1040 = il1040
  }

  /**
   * Index 0: Help
   */
  Help = (): string | undefined => {
    return undefined
  }

  f0 = (): string | undefined => this.Help()

  /**
   * Index 1: PrimarySSN1
   */
  PrimarySSN1 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(0, 3)

  f1 = (): string | undefined => this.PrimarySSN1()

  /**
   * Index 2: PrimarySSN2
   */
  PrimarySSN2 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(3, 5)

  f2 = (): string | undefined => this.PrimarySSN2()

  /**
   * Index 3: PrimarySSN3
   */
  PrimarySSN3 = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.ssid.slice(5)

  f3 = (): string | undefined => this.PrimarySSN3()

  /**
   * Index 4: SpouseSSN1
   */
  SpouseSSN1 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(0, 3)

  f4 = (): string | undefined => this.SpouseSSN1()

  /**
   * Index 5: SpouseSSN2
   */
  SpouseSSN2 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(3, 5)

  f5 = (): string | undefined => this.SpouseSSN2()

  /**
   * Index 6: SpouseSSN3
   */
  SpouseSSN3 = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid.slice(5)

  f6 = (): string | undefined => this.SpouseSSN3()

  /**
   * Index 7: FirstName
   */
  FirstName = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.firstName

  f7 = (): string | undefined => this.FirstName()

  /**
   * Index 8: SpouseFirstName
   */
  SpouseFirstName = (): string | undefined =>
    this.info.taxPayer.spouse?.firstName

  f8 = (): string | undefined => this.SpouseFirstName()

  /**
   * Index 9: LastName
   */
  LastName = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.lastName

  f9 = (): string | undefined => this.LastName()

  /**
   * Index 10: Address
   */
  Address = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.address

  f10 = (): string | undefined => this.Address()

  /**
   * Index 11: City
   */
  City = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.city

  f11 = (): string | undefined => this.City()

  /**
   * Index 12: State
   */
  State = (): string | undefined =>
    this.info.taxPayer.primaryPerson?.address.state

  f12 = (): string | undefined => this.State()

  /**
   * Index 13: ZIP
   */
  ZIP = (): string | undefined => this.info.taxPayer.primaryPerson?.address.zip

  f13 = (): string | undefined => this.ZIP()

  /**
   * Index 14: PaymentAmount
   */
  PaymentAmount = (): number | undefined => {
    const amount = this.il1040.l39()
    if (amount !== undefined) {
      return Math.trunc(amount)
    }
  }

  f14 = (): number | undefined => this.PaymentAmount()

  /**
   * Index 15: PaymentAmountCents
   */
  PaymentAmountCents = (): number | undefined => {
    const amount = this.il1040.l39()
    if (amount !== undefined) {
      return Math.round((amount - Math.trunc(amount)) * 100)
    }
  }

  f15 = (): number | undefined => this.PaymentAmountCents()

  /**
   * Index 16: Reset
   */
  Reset = (): string | undefined => {
    return undefined
  }

  f16 = (): string | undefined => this.Reset()

  /**
   * Index 17: Print
   */
  Print = (): string | undefined => {
    return undefined
  }

  f17 = (): string | undefined => this.Print()

  /**
   * Index 18: scanline
   */
  scanline = (): string | undefined => {
    return undefined
  }

  f18 = (): string | undefined => this.scanline()

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
    this.f18()
  ]
}
