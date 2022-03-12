import Currency from './Currency'
import LabeledInput from './LabeledInput'
import { LabeledCheckbox } from './LabeledCheckbox'
import { LabeledRadio } from './LabeledRadio'
import LabeledDropdown, {
  GenericLabeledDropdown,
  USStateDropDown
} from './LabeledDropdown'
import boxLabel from './boxLabel'
import { DatePicker } from './DatePicker'

/**
 * Format a string like "123456789" as "123-45-6789". If the string is not
 * exactly 9 digits long, it returns empty string
 */
const formatSSID = (a: string): string =>
  (a.match(/^([0-9]{3})([0-9]{2})([0-9]{4}$)/) ?? []).slice(1).join('-')

/**
 * Format a string like "123456789" as "12-3456789". If the string is not
 * exactly 9 digits long, it returns empty string
 */
const formatEIN = (a: string): string =>
  (a.match(/^([0-9]{2})([0-9]{7})/) ?? []).slice(1).join('-')

export {
  boxLabel,
  Currency,
  formatSSID,
  formatEIN,
  LabeledInput,
  LabeledCheckbox,
  LabeledDropdown,
  LabeledRadio,
  GenericLabeledDropdown,
  USStateDropDown,
  DatePicker
}
