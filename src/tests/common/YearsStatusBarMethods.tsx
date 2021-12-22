/* eslint-disable @typescript-eslint/no-non-null-assertion */

import userEvent from '@testing-library/user-event'
import { TaxYear } from 'ustaxes/data'
import TestPage from './Page'

export default class YearStatusBarMethods {
  page: TestPage

  constructor(page: TestPage) {
    this.page = page
  }

  yearDropdownButton = (): HTMLElement | null =>
    this.page.rendered().queryByTestId('year-dropdown-button')

  openDropdown = (): void => {
    userEvent.click(this.yearDropdownButton()!)
  }

  yearSelect = (): HTMLSelectElement | null => {
    const boxes = this.page
      .rendered()
      .queryAllByRole('combobox') as HTMLInputElement[]

    const box = boxes.find((box) => box.getAttribute('name') === 'year') ?? null

    return box as HTMLSelectElement | null
  }

  year = (): HTMLInputElement | null =>
    this.page.rendered().getByLabelText('Select Tax Year') as HTMLInputElement

  yearValue = (): string | undefined => {
    const y = this.year()
    return y?.value
  }

  yearSelectConfirm = (): HTMLButtonElement | null =>
    this.page.rendered().queryByRole('button', {
      name: /Update/
    }) as HTMLButtonElement

  getOption = (y: TaxYear): HTMLOptionElement | null =>
    (this.page
      .rendered()
      .getAllByRole('option')
      .find((x) => x.getAttribute('value') === y) as
      | HTMLOptionElement
      | undefined) ?? null

  setYear = (y: TaxYear): void => {
    userEvent.selectOptions(this.yearSelect()!, [y])
    userEvent.click(this.yearSelectConfirm()!)
  }
}
