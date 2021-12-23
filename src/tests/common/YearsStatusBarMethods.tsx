/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxYear } from 'ustaxes/data'
import DomMethods from './DomMethods'

export default class YearStatusBarMethods extends DomMethods {
  yearDropdownButton = (): HTMLElement | null =>
    within(this.dom()).queryByTestId('year-dropdown-button')

  openDropdown = (): void => {
    userEvent.click(this.yearDropdownButton()!)
  }

  yearSelect = (): HTMLSelectElement =>
    within(this.dom()).getByRole('combobox') as HTMLSelectElement

  year = (): HTMLInputElement | null =>
    within(this.dom()).getByLabelText('Select Tax Year') as HTMLInputElement

  yearValue = (): string | undefined => {
    const y = this.year()
    return y?.value
  }

  yearSelectConfirm = (): HTMLButtonElement | null =>
    within(this.dom()).queryByRole('button', {
      name: /Update/
    }) as HTMLButtonElement

  getOption = (y: TaxYear): HTMLOptionElement | null =>
    (within(this.dom())
      .getAllByRole('option')
      .find((x) => x.getAttribute('value') === y) as
      | HTMLOptionElement
      | undefined) ?? null

  setYear = (y: TaxYear): void => {
    userEvent.selectOptions(this.yearSelect()!, [y])
    userEvent.click(this.yearSelectConfirm()!)
  }
}
