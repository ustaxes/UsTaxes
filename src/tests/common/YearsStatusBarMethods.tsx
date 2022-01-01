/* eslint-disable @typescript-eslint/no-non-null-assertion */

import {
  waitFor,
  waitForElementToBeRemoved,
  within
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { enumKeys } from 'ustaxes/core/util'
import { TaxYear, TaxYears } from 'ustaxes/data'
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
    within(this.dom()).queryByLabelText(
      'Select Tax Year'
    ) as HTMLInputElement | null

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
    }) as HTMLButtonElement | null

  getOption = (y: TaxYear): HTMLOptionElement | null =>
    (within(this.dom())
      .getAllByRole('option')
      .find((x) => x.getAttribute('value') === y) as
      | HTMLOptionElement
      | undefined) ?? null

  setYear = async (y: TaxYear): Promise<void> => {
    this.openDropdown()
    await waitFor(async () => {
      expect(this.yearSelectConfirm()).toBeInTheDocument()
    })

    userEvent.selectOptions(this.yearSelect(), [y])
    userEvent.click(this.yearSelectConfirm()!)

    await waitForElementToBeRemoved(() => this.yearSelectConfirm())
  }
}
