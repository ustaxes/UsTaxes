/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as fc from 'fast-check'
import * as utarbitraries from './arbitraries'
import { cleanup, waitFor } from '@testing-library/react'
import { TaxYear } from 'ustaxes/data'
import { YearsTaxesState } from 'ustaxes/redux'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import TaxPayer from 'ustaxes/components/TaxPayer'
import { tests as TaxPayerTests } from './components/Taxpayer.test'
import { blankState } from 'ustaxes/redux/reducer'
import { FakePagerProvider } from './common/FakePager'
import prand from 'pure-rand'
import YearStatusBar from 'ustaxes/components/YearStatusBar'
import { TaxPayerTestPage } from './components/TaxPayerTestPage'

// RTL's cleanup method only after each
// jest test is done. (Not each property test)
afterEach(async () => {
  cleanup()
})

jest.setTimeout(40000)

fc.configureGlobal({
  interruptAfterTimeLimit: 35000,
  markInterruptAsFailure: false // When set to true, timeout during initial cases (1) will be marked as an error
  // When set to false, timeout during initial cases (1) will not be considered as a failure
})

const gen = new fc.Random(prand.mersenne(new Date().getMilliseconds()))

const justOneState = (): YearsTaxesState =>
  utarbitraries.taxesState.noShrink().generate(gen).value

class TestForm extends TaxPayerTestPage {
  doneEv = jest.fn()
  component: ReactElement = (
    <FakePagerProvider>
      <YearStatusBar />
      <TaxPayer />
    </FakePagerProvider>
  )

  saveButton = (): HTMLButtonElement =>
    this.rendered().getByRole('button', { name: /Save/i }) as HTMLButtonElement

  yearDropdownButton = (): HTMLElement | null =>
    this.rendered().queryByTestId('year-dropdown-button')

  openDropdown = (): void => {
    userEvent.click(this.yearDropdownButton()!)
  }

  yearSelect = (): HTMLSelectElement | null => {
    const boxes = this.rendered().queryAllByRole(
      'combobox'
    ) as HTMLInputElement[]

    const box = boxes.find((box) => box.getAttribute('name') === 'year') ?? null

    return box as HTMLSelectElement | null
  }

  year = (): HTMLInputElement | null =>
    this.rendered().getByLabelText('Select Tax Year') as HTMLInputElement

  yearValue = (): string | undefined => {
    const y = this.year()
    return y?.value
  }

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
    userEvent.selectOptions(this.yearSelect()!, [y])
    userEvent.click(this.yearSelectConfirm()!)
  }
}

const withForm =
  (state: YearsTaxesState) =>
  async (
    f: (form: TestForm) => Promise<boolean | undefined>
  ): Promise<boolean> => {
    try {
      const form = new TestForm(state)

      await waitFor(async () =>
        expect(form.yearDropdownButton()).toBeInTheDocument()
      )

      form.openDropdown()

      await waitFor(async () =>
        expect(form.yearDropdownButton()).not.toBeInTheDocument()
      )

      expect(form.yearSelect()).toBeInTheDocument()

      try {
        let res = await f(form).catch((e) => {
          console.info('Error caught in handling promise.')
          console.info(e)
          console.info(form.rendered().container.innerHTML)
          form.cleanup()
          throw e
        })
        res = res === undefined ? true : res

        form.cleanup()
        return res
      } catch (e) {
        console.info('Error caught in handling outer.')
        console.info(e)
        console.info(form.rendered().container.innerHTML)
        form.cleanup()
        throw e
      }
    } catch (e) {
      console.error('Caught exception')
      console.info(state)
      throw e
    }
  }

describe('years', () => {
  it('should start with correct selected', async () => {
    const state = justOneState()

    await withForm(state)(async (form): Promise<boolean> => {
      await waitFor(async () => {
        expect(form.store.getState().activeYear).toBe(state.activeYear)
        expect(form.yearValue()).toEqual(state.activeYear)
      })
      return true
    })
  })

  it('should set active year in model', async () => {
    await fc
      .assert(
        fc.asyncProperty(
          utarbitraries.taxYear,
          utarbitraries.taxYear,
          async (startYear, year) => {
            // Generating states can lead to long runtimes as the generator
            // tries to fiddle with all of state's parameters to induce a failure.
            // We're just testing the year part of the state now.
            const state = { [startYear]: blankState, activeYear: startYear }
            await withForm(state)(async (form): Promise<boolean> => {
              form.setYear(year)

              await waitFor(async () =>
                expect(form.store.getState().activeYear).toEqual(year)
              )
              form.openDropdown()
              await waitFor(async () => expect(form.yearValue()).toEqual(year))
              return true
            })
          }
        )
      )
      .catch((e) => {
        console.info('exception from property')
        throw e
      })
  })

  it('should update form data on select', async () =>
    await fc.assert(
      fc.asyncProperty(utarbitraries.taxYear, async (year) => {
        const state = justOneState()
        await withForm(state)(async (form) => {
          form.setYear(year)

          await waitFor(async () =>
            expect(form.firstName()?.value).toEqual(
              state[year]?.taxPayer.primaryPerson?.firstName
            )
          )

          return true
        })
      })
    ))

  it('selecting year should not impact taxpayer form error handling after changing year', async () => {
    const form = new TestForm({ Y2020: blankState, activeYear: 'Y2020' })

    await TaxPayerTests.incompleteData(form)

    form.openDropdown()

    await waitFor(async () => expect(form.yearSelect()).toBeInTheDocument())

    form.setYear('Y2021')

    await TaxPayerTests.incompleteData(form)

    form.cleanup()
  })
})