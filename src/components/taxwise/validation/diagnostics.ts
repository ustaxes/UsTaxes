import { Information } from 'ustaxes/core/data'

export type DiagnosticLevel = 'error' | 'warning' | 'info'

export type Diagnostic = {
  id: string
  level: DiagnosticLevel
  message: string
  section: string
}

const normalizeSsn = (value?: string): string =>
  (value ?? '').replace(/\D/g, '')

const isValidSsn = (value?: string): boolean =>
  /^\d{9}$/.test(normalizeSsn(value))

const calculateAge = (dateOfBirth?: Date): number | undefined => {
  if (!dateOfBirth) return undefined
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDiff = today.getMonth() - dateOfBirth.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1
  }
  return age
}

export const buildDiagnostics = (info: Information): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []

  const primary = info.taxPayer.primaryPerson
  if (!primary || !isValidSsn(primary.ssid)) {
    diagnostics.push({
      id: 'primary-ssn',
      level: 'error',
      section: 'Client Info',
      message: 'Primary taxpayer SSN/ITIN is missing or invalid.'
    })
  }

  const spouse = info.taxPayer.spouse
  if (spouse && !isValidSsn(spouse.ssid)) {
    diagnostics.push({
      id: 'spouse-ssn',
      level: 'error',
      section: 'Client Info',
      message: 'Spouse SSN/ITIN is missing or invalid.'
    })
  }

  info.taxPayer.dependents.forEach((dependent, index) => {
    if (!isValidSsn(dependent.ssid)) {
      diagnostics.push({
        id: `dependent-ssn-${index}`,
        level: 'error',
        section: 'Client Info',
        message: `Dependent ${index + 1} SSN/ITIN is missing or invalid.`
      })
    }

    if (Number.isNaN(dependent.dateOfBirth.getTime())) {
      diagnostics.push({
        id: `dependent-dob-${index}`,
        level: 'error',
        section: 'Credits',
        message: `Dependent ${index + 1} date of birth is missing.`
      })
    }

    if (!dependent.relationship) {
      diagnostics.push({
        id: `dependent-relationship-${index}`,
        level: 'warning',
        section: 'Credits',
        message: `Dependent ${index + 1} relationship is missing.`
      })
    }

    const age = calculateAge(dependent.dateOfBirth)
    if (age !== undefined && age > 24 && !dependent.qualifyingInfo?.isStudent) {
      diagnostics.push({
        id: `dependent-age-${index}`,
        level: 'warning',
        section: 'Credits',
        message: `Dependent ${index + 1} age exceeds typical credit limits.`
      })
    }
  })

  info.w2s.forEach((w2, index) => {
    const employer = w2.employer
    if (!employer || !employer.employerName || !employer.EIN) {
      diagnostics.push({
        id: `w2-employer-${index}`,
        level: 'warning',
        section: 'Income',
        message: `W-2 ${index + 1} is missing employer details.`
      })
    }

    if (!w2.income || w2.income <= 0) {
      diagnostics.push({
        id: `w2-income-${index}`,
        level: 'warning',
        section: 'Income',
        message: `W-2 ${index + 1} wages appear incomplete.`
      })
    }
  })

  info.f1099s.forEach((form, index) => {
    if (!form.payer) {
      diagnostics.push({
        id: `1099-payer-${index}`,
        level: 'warning',
        section: 'Income',
        message: `1099 ${index + 1} payer name is missing.`
      })
    }
  })

  return diagnostics
}
