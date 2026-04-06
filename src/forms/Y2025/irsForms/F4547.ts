import F1040Attachment from './F1040Attachment'
import { Dependent } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'
import { CURRENT_YEAR } from '../data/federal'

/** Children born 2025-2028 are eligible for the Trump Account pilot program. */
const TRUMP_ACCOUNT_BIRTH_YEAR_MIN = 2025
const TRUMP_ACCOUNT_BIRTH_YEAR_MAX = 2028

/** Form 4547 — Trump Account election (OBBB). */
export default class F4547 extends F1040Attachment {
  tag: FormTag = 'f4547'
  sequenceIndex = 25

  constructor(f1040: F1040) {
    super(f1040)
  }

  /** Dependents born within the pilot program window who are under 18. */
  eligibleChildren = (): Dependent[] =>
    this.f1040.info.taxPayer.dependents.filter((dep) => {
      const birthYear = dep.dateOfBirth.getFullYear()
      const age = CURRENT_YEAR - birthYear
      return (
        birthYear >= TRUMP_ACCOUNT_BIRTH_YEAR_MIN &&
        birthYear <= TRUMP_ACCOUNT_BIRTH_YEAR_MAX &&
        age < 18
      )
    })

  private electing = (): boolean =>
    (this.f1040.info.obbbDeductions?.electTrumpAccountContribution ?? false) &&
    this.eligibleChildren().length > 0

  isNeeded = (): boolean => this.electing()

  private dobMonth = (d: Date): string =>
    String(d.getMonth() + 1).padStart(2, '0')
  private dobDay = (d: Date): string => String(d.getDate()).padStart(2, '0')
  private dobYear = (d: Date): string => String(d.getFullYear())

  /** Eligible child at slot index (0-based), or undefined if none. */
  private child = (i: number): Dependent | undefined =>
    this.eligibleChildren()[i]

  fields = (): Field[] => {
    const c0 = this.child(0)
    const c1 = this.child(1)
    return [
      // Part I — filer identification
      this.f1040.namesString(),
      undefined,
      undefined,
      this.f1040.info.taxPayer.primaryPerson.ssid,
      // Address block (9 fields)
      this.f1040.info.taxPayer.primaryPerson.address.address,
      this.f1040.info.taxPayer.primaryPerson.address.aptNo,
      this.f1040.info.taxPayer.primaryPerson.address.city,
      this.f1040.info.taxPayer.primaryPerson.address.state,
      this.f1040.info.taxPayer.primaryPerson.address.zip,
      undefined, // foreign country
      undefined, // foreign province
      undefined, // foreign postal code
      undefined, // phone
      // Part II — child 1 header fields
      c0 ? `${c0.firstName} ${c0.lastName}` : undefined,
      c0?.relationship,
      undefined,
      // Part II — child table rows (Row1a/1b/1c: name parts + DOB)
      c0 ? `${c0.firstName} ${c0.lastName}` : undefined,
      c0?.ssid,
      c0 ? this.dobMonth(c0.dateOfBirth) : undefined,
      c0 ? this.dobDay(c0.dateOfBirth) : undefined,
      c0 ? this.dobYear(c0.dateOfBirth) : undefined,
      undefined,
      // Row2: SSNs for child 1 and child 2
      c0?.ssid,
      c1?.ssid,
      // Row3-4 additional child info
      c1 ? `${c1.firstName} ${c1.lastName}` : undefined,
      c1?.relationship,
      undefined,
      undefined,
      // Row5: eligibility checkboxes
      this.electing(),
      false,
      // Row5a-5i: up to 9 additional children (2 fields each = 18 fields)
      ...Array.from({ length: 9 }, (_, i) => {
        const child = this.child(i + 2)
        return [
          child ? `${child.firstName} ${child.lastName}` : undefined,
          child?.ssid
        ]
      }).flat(),
      // Row6 checkboxes
      undefined,
      undefined,
      // Part III — pilot program election
      this.electing(), // c1_5: Yes — elect the $1,000 contribution
      false, // c1_6: No
      // Part IV
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined
    ]
  }

  fillInstructions = (): FillInstructions => {
    const c0 = this.child(0)
    const c1 = this.child(1)

    const childRows = Array.from({ length: 9 }, (_, i): FillInstructions => {
      const child = this.child(i + 2)
      const row = String.fromCharCode('a'.charCodeAt(0) + i) // 'a'..'i'
      return [
        text(
          `form1[0].Page1[0].Table_Part2[0].Row5${row}[0].f1_${29 + i * 2}[0]`,
          child ? `${child.firstName} ${child.lastName}` : undefined
        ),
        text(
          `form1[0].Page1[0].Table_Part2[0].Row5${row}[0].f1_${30 + i * 2}[0]`,
          child?.ssid
        )
      ]
    }).flat()

    return [
      // Part I — filer identification
      text('form1[0].Page1[0].f1_01[0]', this.f1040.namesString()),
      text('form1[0].Page1[0].f1_02[0]', undefined),
      text('form1[0].Page1[0].f1_03[0]', undefined),
      text(
        'form1[0].Page1[0].f1_04[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      // Address block
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_05[0]',
        this.f1040.info.taxPayer.primaryPerson.address.address
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_06[0]',
        this.f1040.info.taxPayer.primaryPerson.address.aptNo
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_07[0]',
        this.f1040.info.taxPayer.primaryPerson.address.city
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_08[0]',
        this.f1040.info.taxPayer.primaryPerson.address.state
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_09[0]',
        this.f1040.info.taxPayer.primaryPerson.address.zip
      ),
      text('form1[0].Page1[0].Address_ReadOrder[0].f1_10[0]', undefined),
      text('form1[0].Page1[0].Address_ReadOrder[0].f1_11[0]', undefined),
      text('form1[0].Page1[0].Address_ReadOrder[0].f1_12[0]', undefined),
      text('form1[0].Page1[0].Address_ReadOrder[0].f1_13[0]', undefined),
      // Part II — child info header
      text(
        'form1[0].Page1[0].f1_14[0]',
        c0 ? `${c0.firstName} ${c0.lastName}` : undefined
      ),
      text('form1[0].Page1[0].f1_15[0]', c0?.relationship),
      text('form1[0].Page1[0].f1_16[0]', undefined),
      // Row1a — child 1 name and SSN
      text(
        'form1[0].Page1[0].Table_Part2[0].Row1a[0].f1_17[0]',
        c0 ? `${c0.firstName} ${c0.lastName}` : undefined
      ),
      text('form1[0].Page1[0].Table_Part2[0].Row1a[0].f1_18[0]', c0?.ssid),
      // Row1b — child 1 DOB
      text(
        'form1[0].Page1[0].Table_Part2[0].Row1b[0].f1_19[0]',
        c0
          ? `${this.dobMonth(c0.dateOfBirth)}/${this.dobDay(c0.dateOfBirth)}`
          : undefined
      ),
      text(
        'form1[0].Page1[0].Table_Part2[0].Row1b[0].f1_20[0]',
        c0 ? this.dobYear(c0.dateOfBirth) : undefined
      ),
      // Row1c — additional child 1 fields
      text('form1[0].Page1[0].Table_Part2[0].Row1c[0].f1_21[0]', undefined),
      text('form1[0].Page1[0].Table_Part2[0].Row1c[0].f1_22[0]', undefined),
      // Row2 — SSNs for two children
      text('form1[0].Page1[0].Table_Part2[0].Row2[0].f1_23[0]', c0?.ssid),
      text('form1[0].Page1[0].Table_Part2[0].Row2[0].f1_24[0]', c1?.ssid),
      // Row3 — child 2 name + relationship
      text(
        'form1[0].Page1[0].Table_Part2[0].Row3[0].f1_25[0]',
        c1 ? `${c1.firstName} ${c1.lastName}` : undefined
      ),
      text(
        'form1[0].Page1[0].Table_Part2[0].Row3[0].f1_26[0]',
        c1?.relationship
      ),
      // Row4 — child 2 DOB
      text(
        'form1[0].Page1[0].Table_Part2[0].Row4[0].f1_27[0]',
        c1
          ? `${this.dobMonth(c1.dateOfBirth)}/${this.dobDay(c1.dateOfBirth)}`
          : undefined
      ),
      text(
        'form1[0].Page1[0].Table_Part2[0].Row4[0].f1_28[0]',
        c1 ? this.dobYear(c1.dateOfBirth) : undefined
      ),
      // Row5 — eligibility confirmation checkboxes
      checkbox(
        'form1[0].Page1[0].Table_Part2[0].Row5[0].c1_1[0]',
        this.electing()
      ),
      checkbox('form1[0].Page1[0].Table_Part2[0].Row5[0].c1_2[0]', false),
      // Row5a-5i — additional children (up to 9 more)
      ...childRows,
      // Row6 checkboxes
      checkbox('form1[0].Page1[0].Table_Part2[0].Row6[0].c1_3[0]', undefined),
      checkbox('form1[0].Page1[0].Table_Part2[0].Row6[0].c1_4[0]', undefined),
      // Part III — pilot program contribution election
      checkbox(
        'form1[0].Page1[0].Table_Part3[0].Row7[0].c1_5[0]',
        this.electing()
      ),
      checkbox(
        'form1[0].Page1[0].Table_Part3[0].Row7[0].c1_6[0]',
        !this.electing()
      ),
      // Part IV — consent and signature
      text('form1[0].Page1[0].f1_47[0]', undefined),
      checkbox('form1[0].Page1[0].c1_7[0]', undefined),
      text('form1[0].Page1[0].f1_48[0]', undefined),
      text('form1[0].Page1[0].f1_49[0]', undefined),
      text('form1[0].Page1[0].f1_50[0]', undefined),
      text('form1[0].Page1[0].f1_51[0]', undefined),
      text('form1[0].Page1[0].f1_52[0]', undefined)
    ]
  }
}
