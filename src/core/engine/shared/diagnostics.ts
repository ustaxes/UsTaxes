import { Diagnostic, TaxReturnPacket } from 'ustaxes/core/returnPacket/types'
import { FilingStatus, TaxYears } from 'ustaxes/core/data'
import { getFederalTables } from 'ustaxes/core/taxYear/tables'

const normalizeSsn = (value?: string): string =>
  (value ?? '').replace(/\D/g, '')

const isValidSsn = (value?: string): boolean =>
  /^\d{9}$/.test(normalizeSsn(value))

const ageOnDate = (dob: Date, asOf: Date): number => {
  const hadBirthday =
    asOf.getMonth() > dob.getMonth() ||
    (asOf.getMonth() === dob.getMonth() && asOf.getDate() >= dob.getDate())
  return asOf.getFullYear() - dob.getFullYear() - (hadBirthday ? 0 : 1)
}

export const buildEngineDiagnostics = (
  packet: TaxReturnPacket
): Diagnostic[] => {
  const diagnostics: Diagnostic[] = []

  if (!packet.taxpayer || !isValidSsn(packet.taxpayer.ssid)) {
    diagnostics.push({
      id: 'primary-ssn',
      level: 'error',
      message: 'Primary taxpayer SSN/ITIN is missing or invalid.',
      section: 'Client Info'
    })
  }

  if (packet.spouse && !isValidSsn(packet.spouse.ssid)) {
    diagnostics.push({
      id: 'spouse-ssn',
      level: 'error',
      message: 'Spouse SSN/ITIN is missing or invalid.',
      section: 'Client Info'
    })
  }

  packet.dependents.forEach((dependent, index) => {
    if (!isValidSsn(dependent.ssid)) {
      diagnostics.push({
        id: `dependent-ssn-${index}`,
        level: 'error',
        message: `Dependent ${dependent.firstName ?? ''} ${
          dependent.lastName ?? ''
        } SSN/ITIN is missing or invalid.`,
        section: 'Dependents'
      })
    }
    if (!dependent.dateOfBirth) {
      diagnostics.push({
        id: `dependent-dob-${index}`,
        level: 'warning',
        message: `Dependent ${dependent.firstName ?? ''} ${
          dependent.lastName ?? ''
        } date of birth is missing.`,
        section: 'Dependents'
      })
    }
  })

  if (packet.dependents.length > 0) {
    const filingStatus = packet.filingStatus ?? FilingStatus.S
    const taxYear = TaxYears[packet.returnInfo.taxYear]
    const tables = getFederalTables(packet.returnInfo.taxYear, filingStatus)
    const cutoffDate = new Date(taxYear, 11, 31)

    packet.dependents.forEach((dependent, index) => {
      if (!dependent.dateOfBirth) {
        return
      }
      const age = ageOnDate(dependent.dateOfBirth, cutoffDate)
      if (age > tables.childTaxCredit.qualifyingAge) {
        diagnostics.push({
          id: `dependent-ctc-age-${index}`,
          level: 'info',
          message: `Dependent ${dependent.firstName ?? ''} ${
            dependent.lastName ?? ''
          } is above the child tax credit age limit.`,
          section: 'Credits'
        })
      }
    })
  }

  if (
    packet.scheduleC.length > 0 &&
    packet.scheduleC.some((c) => c.expenses < 0)
  ) {
    diagnostics.push({
      id: 'schedule-c-expenses',
      level: 'warning',
      message: 'Schedule C expenses should not be negative.',
      section: 'Income'
    })
  }

  const wages = packet.incomes
    .filter((income) => income.type === 'W2')
    .reduce((sum, income) => sum + (income.amount ?? 0), 0)
  const necIncome = packet.incomes
    .filter((income) => income.type === '1099-NEC')
    .reduce((sum, income) => sum + (income.amount ?? 0), 0)
  const scheduleCNet = packet.scheduleC.reduce(
    (sum, item) => sum + (item.grossReceipts - item.expenses),
    0
  )
  const earnedIncome = wages + necIncome + scheduleCNet

  const additionalMedicareThresholds: Record<FilingStatus, number> = {
    [FilingStatus.S]: 200000,
    [FilingStatus.MFJ]: 250000,
    [FilingStatus.MFS]: 125000,
    [FilingStatus.HOH]: 200000,
    [FilingStatus.W]: 200000
  }

  const threshold =
    additionalMedicareThresholds[packet.filingStatus ?? FilingStatus.S]

  if (earnedIncome > threshold) {
    diagnostics.push({
      id: 'additional-medicare-not-implemented',
      level: 'info',
      message:
        'Additional Medicare tax is not implemented for incomes above the threshold.',
      section: 'Income'
    })
  }

  return diagnostics
}
