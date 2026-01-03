import { State } from 'ustaxes/core/data'
import OhioModule from './OhioModule'
import { StateModule } from './types'

const registry: Record<State, StateModule | undefined> = {
  AL: undefined,
  AK: undefined,
  AZ: undefined,
  CO: undefined,
  DC: undefined,
  FL: undefined,
  HI: undefined,
  ID: undefined,
  IN: undefined,
  KY: undefined,
  MA: undefined,
  ME: undefined,
  MN: undefined,
  MS: undefined,
  NC: undefined,
  NE: undefined,
  NJ: undefined,
  NV: undefined,
  OH: OhioModule,
  OR: undefined,
  RI: undefined,
  SD: undefined,
  TX: undefined,
  VA: undefined,
  WA: undefined,
  WV: undefined,
  AR: undefined,
  CA: undefined,
  CT: undefined,
  DE: undefined,
  GA: undefined,
  IA: undefined,
  IL: undefined,
  KS: undefined,
  LA: undefined,
  MD: undefined,
  MI: undefined,
  MO: undefined,
  MT: undefined,
  ND: undefined,
  NH: undefined,
  NM: undefined,
  NY: undefined,
  OK: undefined,
  PA: undefined,
  SC: undefined,
  TN: undefined,
  UT: undefined,
  VT: undefined,
  WI: undefined,
  WY: undefined
}

export const getModule = (stateCode: State): StateModule | undefined =>
  registry[stateCode]

export const listSupportedStates = (): StateModule[] =>
  Object.values(registry).filter(Boolean) as StateModule[]
