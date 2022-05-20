import { FilingStatus } from 'ustaxes/core/data'

const parameters = {
  exemptions: {
    [FilingStatus.S]: {
      incomeLowerLimit: 2375,
      incomeUpperLimit: 250000,
      exemptionAmount: 2375
    },
    [FilingStatus.MFJ]: {
      incomeLowerLimit: 4750,
      incomeUpperLimit: 500000,
      exemptionAmount: 4750
    }
  },
  taxRate: 0.0495,
  seniorExemption: 1000,
  blindExemption: 1000,
  earnedIncomeCreditFactor: 0.18,
  eicDependentCredit: 2325
}

export default parameters
