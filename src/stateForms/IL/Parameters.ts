import { FilingStatus } from '../../redux/data'

const parameters = {
  exemptions: {
    [FilingStatus.S]: {
      incomeLowerLimit: 2325,
      incomeUpperLimit: 250000,
      exemptionAmount: 2325
    },
    [FilingStatus.MFJ]: {
      incomeLowerLimit: 4650,
      incomeUpperLimit: 500000,
      exemptionAmount: 4650
    }
  },
  taxRate: 0.0495,
  seniorExemption: 1000,
  blindExemption: 1000,
  earnedIncomeCreditFactor: 0.18,
  eicDependentCredit: 2325
}

export default parameters
