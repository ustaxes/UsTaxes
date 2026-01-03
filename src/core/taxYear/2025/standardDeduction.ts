import { FilingStatus } from 'ustaxes/core/data'

export const standardDeduction2025 = (filingStatus: FilingStatus): number => {
  switch (filingStatus) {
    case FilingStatus.MFJ:
    case FilingStatus.W:
      return 31500
    case FilingStatus.MFS:
      return 15750
    case FilingStatus.HOH:
      return 23625
    case FilingStatus.S:
    default:
      return 15750
  }
}
