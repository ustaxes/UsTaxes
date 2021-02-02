import { Dependent, FilingStatus, IncomeW2, Information, PersonRole } from '../redux/data'

interface FieldMapping {
  [field: number]: (info: Information) => string | boolean | undefined
}

const depField = (s: Information, pdfFieldIdx: number): string | boolean | undefined => {
  const deps: Dependent[] = s.taxPayer?.dependents ?? []

  // Based on the PDF row we are on, select correct dependent
  const depIdx = Math.floor((pdfFieldIdx - 32) / 5)

  if (depIdx < deps.length) {
    const dep = deps[depIdx]
    // Based on the PDF column, select the correct field
    const depFieldIdx = (pdfFieldIdx - 32) % 5
    return [`${dep.firstName} ${dep.lastName}`, dep.ssid, dep.relationship, false, false][depFieldIdx]
  }

  return undefined
}

// 1040 allows 4 dependents listed without a supplemental schedule,
// so create field mappings for 4x5 grid of fields
const depFieldMappings: FieldMapping = Object.fromEntries(
  Array.from(Array(20)).map((u, n: number) => [n + 32, (s: Information) => depField(s, n + 32)])
)

const wages = (s: Information): number => {
  if ((s.w2s ?? []).length < 1) {
    return 0
  }
  return s.w2s.map((w2) => w2.income).reduce((l, r) => l + r)
}

const fedWithholding = (s: Information): number => {
  if ((s.w2s ?? []).length < 1) {
    return 0
  }
  return s.w2s.map((w2) => w2.fedWithholding).reduce((l, r) => l + r)
}

const w2ForRole = (s: Information, r: PersonRole): IncomeW2 | undefined =>
  (s.w2s ?? []).find((w2) => w2.personRole === r)

const fieldMappings: FieldMapping = {
  0: (s) => s.taxPayer?.filingStatus === FilingStatus.S,
  1: (s) => s.taxPayer?.filingStatus === FilingStatus.MFJ,
  2: (s) => s.taxPayer?.filingStatus === FilingStatus.MFS,
  3: (s) => s.taxPayer?.filingStatus === FilingStatus.HOH,
  4: (s) => s.taxPayer?.filingStatus === FilingStatus.W,
  5: (s) => '',
  6: (s) => s.taxPayer?.primaryPerson?.firstName,
  7: (s) => s.taxPayer?.primaryPerson?.lastName,
  8: (s) => s.taxPayer?.primaryPerson?.ssid,
  9: (s) => s.taxPayer?.spouse?.firstName,
  10: (s) => s.taxPayer?.spouse?.lastName,
  11: (s) => s.taxPayer?.spouse?.ssid,
  12: (s) => s.taxPayer?.primaryPerson?.address?.address,
  13: (s) => s.taxPayer?.primaryPerson?.address?.aptNo,
  14: (s) => s.taxPayer?.primaryPerson?.address?.city,
  15: (s) => s.taxPayer?.primaryPerson?.address?.state,
  16: (s) => s.taxPayer?.primaryPerson?.address?.zip,
  17: (s) => s.taxPayer?.primaryPerson?.address?.foreignCountry,
  18: (s) => s.taxPayer?.primaryPerson?.address?.province,
  19: (s) => s.taxPayer?.primaryPerson?.address?.postalCode,
  20: (s) => false,
  21: (s) => false,
  22: (s) => false,
  23: (s) => false,
  24: (s) => false,
  31: (s) => (s.taxPayer?.dependents?.length ?? 0) > 4,
  ...depFieldMappings,
  // Note fields 35, 36 and related not yet supported
  52: (s) => wages(s).toString(),
  // 52-62 interest + dividends not yet supported (sch b)
  // 64: capital gains not yet supported (sch d)
  // 65: Schedule 1, not yet supported
  // 66: self-computing, not yet supported
  // 67: Schedule 1, not yet supported
  // 68: Charitable contributions, not yet supported
  // 69-70: Self-computing, not yet supported
  // 71: Itemized / standard deduction, not yet supported
  // 72: Business deduction, not yet supported
  // 73-74: Self computing, not yet supported
  88: (s) => fedWithholding(s).toString(),
  // 89: 1099s not supported
  // 90: other forms not supported
  // 91: Self-computing, not supported
  // 92: estimated tax payments, not supported
  // 93-97: credits not supported
  // 98-100: self-computing, not supported,
  // 101: form 8888, not supported
  // 102: Refund amount, not supported
  103: (s) => s.refund?.routingNumber,
  // 104, 105: Account type
  106: (s) => s.refund?.accountNumber,
  // 107: overpayment applied to est tax, not supported,
  // 108: total tax amount owed, self computing, not supported
  // 109: estimated tax penalty, not supported
  // 110-114: other party, not supported
  115: (s) => w2ForRole(s, PersonRole.PRIMARY)?.occupation ?? '',
  // 116: Primary pin, not supported
  117: (s) => w2ForRole(s, PersonRole.SPOUSE)?.occupation ?? '',
  // 118: Spouse pin, not supported
  119: (s) => s.taxPayer?.contactPhoneNumber,
  120: (s) => s.taxPayer?.contactEmail
  // 121 -> 127: Paid preparer, not applicable
}

export default fieldMappings
