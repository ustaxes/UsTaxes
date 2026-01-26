import F1040Attachment from './F1040Attachment'
import { Dependent } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text, checkbox } from 'ustaxes/core/pdfFiller'
import F1040 from './F1040'
import { CURRENT_YEAR } from '../data/federal'

type EligibleDependent = Dependent & { dateOfBirth: Date }

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
  eligibleChildren = (): EligibleDependent[] =>
    this.f1040.info.taxPayer.dependents.filter((dep): dep is EligibleDependent => {
      if (!(dep.dateOfBirth instanceof Date)) {
        return false
      }
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
  private child = (i: number): EligibleDependent | undefined =>
    this.eligibleChildren()[i]

  /** Keep legacy positional values aligned with native fillInstructions(). */
  fields = (): Field[] => this.fillInstructions().map((instruction) => instruction.value)

  fillInstructions = (): FillInstructions => {
    const tp = this.f1040.info.taxPayer
    const c0 = this.child(0)
    const c1 = this.child(1)
    const address = tp.primaryPerson.address

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
        tp.primaryPerson.ssid
      ),
      // Address block
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_05[0]',
        address?.address
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_06[0]',
        address?.aptNo
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_07[0]',
        address?.city
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_08[0]',
        address?.state
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_09[0]',
        address?.zip
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_10[0]',
        address?.foreignCountry
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_11[0]',
        address?.province
      ),
      text(
        'form1[0].Page1[0].Address_ReadOrder[0].f1_12[0]',
        address?.postalCode
      ),
      text('form1[0].Page1[0].Address_ReadOrder[0].f1_13[0]', tp.contactPhoneNumber),
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
