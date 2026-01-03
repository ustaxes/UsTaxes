import { FilingStatus } from 'ustaxes/core/data'

export const federalBrackets2025 = {
  rates: [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37],
  brackets: {
    [FilingStatus.S]: [11925, 48475, 103350, 197300, 250525, 626350],
    [FilingStatus.MFJ]: [23850, 96950, 206700, 394600, 501050, 751600],
    [FilingStatus.W]: [23850, 96950, 206700, 394600, 501050, 751600],
    [FilingStatus.MFS]: [11925, 48475, 103350, 197300, 250525, 375800],
    [FilingStatus.HOH]: [17000, 64850, 103350, 197300, 250500, 626350]
  }
} as const
