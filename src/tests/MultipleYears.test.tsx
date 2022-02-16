/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as fc from 'fast-check'
import * as utarbitraries from './arbitraries'
import { cleanup, waitFor } from '@testing-library/react'
import { blankYearTaxesState, YearsTaxesState } from 'ustaxes/redux'
import { ReactElement } from 'react'
import TaxPayer from 'ustaxes/components/TaxPayer'
import { tests as TaxPayerTests } from './components/Taxpayer.test'
import { blankState } from 'ustaxes/redux/reducer'
import { FakePagerProvider, PagerMethods } from './common/FakePager'
import YearStatusBar from 'ustaxes/components/YearStatusBar'
import TaxPayerMethods from './common/TaxPayerMethods'
import YearStatusBarMethods from './common/YearsStatusBarMethods'
import { PersonMethods } from './common/PersonMethods'
import TestPage from './common/Page'

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

class TestForm extends TestPage {
  yearStatus: YearStatusBarMethods
  person: PersonMethods
  taxPayer: TaxPayerMethods
  pager: PagerMethods

  constructor(state: YearsTaxesState) {
    super(state)
    this.yearStatus = new YearStatusBarMethods(() =>
      this.rendered().getByTestId('year-status-bar')
    )
    this.person = new PersonMethods(() =>
      this.rendered().getByTestId('taxpayer')
    )
    this.taxPayer = new TaxPayerMethods(() =>
      this.rendered().getByTestId('taxpayer')
    )
    this.pager = new PagerMethods(() => this.rendered().getByTestId('taxpayer'))
  }

  component: ReactElement = (
    <FakePagerProvider>
      <div data-testid="year-status-bar">
        <YearStatusBar />
      </div>
      <div data-testid="taxpayer">
        <TaxPayer />
      </div>
    </FakePagerProvider>
  )
}

const withForm =
  (state: YearsTaxesState) =>
  async (
    f: (form: TestForm) => Promise<boolean | undefined>
  ): Promise<boolean> => {
    try {
      const form = new TestForm(state)

      try {
        const res = await f(form).catch((e) => {
          console.info('Error caught in handling promise.')
          console.info(e)
          console.info(form.rendered().container.innerHTML)
          form.cleanup()
          throw e
        })

        form.cleanup()
        return res ?? true
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
  it('should have open feature', async () => {
    const state = utarbitraries.justOneState()

    await withForm(state)(async (form): Promise<boolean> => {
      await waitFor(async () =>
        expect(form.yearStatus.yearDropdownButton()).toBeInTheDocument()
      )

      form.yearStatus.openDropdown()

      await waitFor(async () =>
        expect(form.yearStatus.yearDropdownButton()).not.toBeInTheDocument()
      )

      expect(form.yearStatus.yearSelect()).toBeInTheDocument()

      return true
    })
  })

  it('should start with correct selected', async () => {
    const state = utarbitraries.justOneState()

    await withForm(state)(async (form): Promise<boolean> => {
      await waitFor(async () => {
        expect(form.store.getState().activeYear).toBe(state.activeYear)
        expect(form.yearStatus.yearValue()).toEqual(state.activeYear)
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
            const state = {
              ...blankYearTaxesState,
              [startYear]: blankState,
              activeYear: startYear
            }
            await withForm(state)(async (form): Promise<boolean> => {
              await form.yearStatus.setYear(year)

              await waitFor(async () =>
                expect(form.store.getState().activeYear).toEqual(year)
              )
              form.yearStatus.openDropdown()
              await waitFor(async () =>
                expect(form.yearStatus.yearValue()).toEqual(year)
              )
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
        const state = utarbitraries.justOneState()
        await withForm(state)(async (form) => {
          await form.yearStatus.setYear(year)

          await waitFor(async () =>
            expect(form.person.firstNameField()?.value).toEqual(
              state[year]?.taxPayer.primaryPerson?.firstName
            )
          )

          return true
        })
      })
    ))

  it('selecting year should not impact taxpayer form error handling after changing year', async () => {
    const form = new TestForm({
      ...blankYearTaxesState,
      Y2020: blankState,
      activeYear: 'Y2020'
    })

    await TaxPayerTests.incompleteData(form)

    await form.yearStatus.setYear('Y2021')

    await TaxPayerTests.incompleteData(form)

    form.cleanup()
  })
})
