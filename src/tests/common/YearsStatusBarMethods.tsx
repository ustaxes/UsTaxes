/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { waitFor, within } from '@testing-library/react'
import { enumKeys } from 'ustaxes/core/util'
import { TaxYear, TaxYears } from 'ustaxes/core/data'
import DomMethods from './DomMethods'

export default class YearStatusBarMethods extends DomMethods {
  yearDropdownButton = (): HTMLElement | null =>
    within(this.dom()).queryByTestId('year-dropdown-button')

  openDropdown = async (): Promise<void> => {
    await this.user.click(this.yearDropdownButton()!)
  }

  yearSelect = (): HTMLSelectElement => within(this.dom()).getByRole('combobox')

  year = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText('Select Tax Year')

  yearValue = (): TaxYear | undefined => {
    const y = this.year()
    if (y !== null) {
      return y.value as TaxYear
    } else {
      const year = this.yearDropdownButton()?.textContent?.trim()
      if (year !== undefined) {
        return enumKeys(TaxYears).find((v) => TaxYears[v] === parseInt(year))
      } else {
        throw new Error('Cannot read year in form')
      }
    }
  }

  yearSelectConfirm = (): HTMLButtonElement | null =>
    within(this.dom()).queryByRole('button', {
      name: /Update/
    })

  getOption = (y: TaxYear): HTMLOptionElement | null =>
    (within(this.dom())
      .getAllByRole('option')
      .find((x) => x.getAttribute('value') === y) as
      | HTMLOptionElement
      | undefined) ?? null

  setYear = async (y: TaxYear): Promise<void> => {
    await this.openDropdown()
    await waitFor(() => {
      expect(this.yearSelectConfirm()).toBeInTheDocument()
    })

    await this.user.selectOptions(this.yearSelect(), [y])
    await this.user.click(this.yearSelectConfirm()!)

    await waitFor(() => {
      expect(this.yearSelectConfirm()).not.toBeInTheDocument()
    })
  }
}
