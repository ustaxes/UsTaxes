import { Person, TaxPayer as TP } from '.'

/**
 * Used to augment the TaxPayer data interface with some convenience
 * methods.
 */
export default class TaxPayer {
  tp: TP

  constructor(tp: TP) {
    this.tp = tp
  }

  namesString = (): string => {
    const ps: Person[] = [this.tp.primaryPerson, this.tp.spouse]
      .filter((p: Person | undefined) => p !== undefined)
      .map((p: Person | undefined) => p as Person)

    return ps.map((p: Person) => `${p.firstName} ${p.lastName}`).join(', ')
  }
}
