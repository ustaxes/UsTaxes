import Currency from './Currency'
import LabeledInput from './LabeledInput'
import { LabeledCheckbox } from './LabeledCheckbox'
import { LabeledRadio } from './LabeledRadio'
import LabeledDropdown, { GenericLabeledDropdown, USStateDropDown } from './LabeledDropdown'

/**
 * Format a string like "123456789" as "123-45-6789". If the string is not
 * exactly 9 digits long, it returns empty string
 */
const formatSSID = (a: string): string =>
  (a.match(/^([0-9]{3})([0-9]{2})([0-9]{4}$)/) ?? []).slice(1).join('-')

export {
  Currency,
  formatSSID,
  LabeledInput,
  LabeledCheckbox,
  LabeledDropdown,
  LabeledRadio,
  GenericLabeledDropdown,
  USStateDropDown
}
