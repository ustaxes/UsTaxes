/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as fc from 'fast-check'
import * as arbitraries from './arbitraries'
import { cleanup, waitFor } from '@testing-library/react'
import YearDropDown from 'ustaxes/components/YearDropDown'
import { TaxYear } from 'ustaxes/redux/data'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import { TaxPayerTestPage } from './components/TaxPayerTestPage'
import TaxPayer from 'ustaxes/components/TaxPayer'

// RTL's cleanup method only after each
// jest test is done. (Not each property test)
afterEach(async () => {
  cleanup()
})

jest.setTimeout(60000)

class TestForm extends TaxPayerTestPage {
  component: ReactElement = (
    <>
      <YearDropDown />
      <TaxPayer />
    </>
  )

  yearSelect = (): HTMLSelectElement | null =>
    this.rendered().queryByRole('combobox', {
      name: 'Select Tax Year'
    }) as HTMLSelectElement | null

  yearSelectConfirm = (): HTMLButtonElement | null =>
    this.rendered().queryByRole('button', {
      name: /Update/
    }) as HTMLButtonElement

  getOption = (y: TaxYear): HTMLOptionElement | null =>
    (this.rendered()
      .getAllByRole('option')
      .find((x) => x.getAttribute('value') === y) as
      | HTMLOptionElement
      | undefined) ?? null

  setYear = (y: TaxYear): void => {
    userEvent.selectOptions(this.yearSelect()!, y)
    userEvent.click(this.yearSelectConfirm()!)
  }

  firstName = (): HTMLInputElement | null =>
    this.rendered().queryByLabelText(
      'First Name and Initial'
    ) as HTMLInputElement | null
}

describe('years', () => {
  it('should start with correct selected', () =>
    fc.assert(
      fc.property(arbitraries.taxesState, (state) => {
        const form = new TestForm(state)

        expect(form.yearSelect()).toBeInTheDocument()

        expect(form.yearSelect()!.value).toEqual(state.activeYear)

        form.cleanup()
      })
    ))

  it('should set active year in model', async () => {
    await fc.assert(
      fc.asyncProperty(
        arbitraries.taxesState,
        arbitraries.taxYear,
        async (state, year) => {
          const form = new TestForm(state)

          form.setYear(year)

          await waitFor(() =>
            expect(form.store?.getState().activeYear).toEqual(year)
          )

          form.cleanup()
        }
      )
    )
  })

  it('should update form data on select', async () =>
    await fc.assert(
      fc.asyncProperty(
        arbitraries.taxesState,
        arbitraries.taxYear,
        async (state, year) => {
          const form = new TestForm(state)

          form.setYear(year)

          await waitFor(() =>
            expect(form.firstName()?.value).toEqual(
              state[year]?.taxPayer.primaryPerson?.firstName
            )
          )

          form.cleanup()
        }
      )
    ))
})
