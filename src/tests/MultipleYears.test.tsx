import * as fc from 'fast-check'
import { cleanup } from '@testing-library/react'
import * as arbitraries from './arbitraries'
import { TestPage } from './common/Page'
import TaxPayer from 'ustaxes/components/TaxPayer'
import YearDropDown from 'ustaxes/components/YearDropDown'
import { Information, TaxYear } from 'ustaxes/redux/data'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'

// RTL's cleanup method only after each
// jest test is done. (Not each property test)
afterEach(async () => {
  cleanup()
})

class TestForm extends TestPage {
  component: ReactElement = (
    <>
      <YearDropDown />
      <TaxPayer />
    </>
  )

  yearSelect = (): Promise<HTMLElement> =>
    this.rendered().findByLabelText('Select TaxYear')

  yearSelectConfirm = (): Promise<HTMLButtonElement> =>
    this.rendered().findByRole('button', {
      name: /Update/
    }) as Promise<HTMLButtonElement>

  setYear = async (y: TaxYear): Promise<void> => {
    userEvent.selectOptions(await this.yearSelect(), y)
    userEvent.click(await this.yearSelectConfirm())
  }

  firstName = async (): Promise<string | undefined> => {
    const f = await this.rendered().findByLabelText('First Name and Initial')
    return f?.getAttribute('value') ?? undefined
  }
}

describe('years', () => {
  it('should switch data in taxpayer form', async () => {
    fc.assert(
      fc.asyncProperty(arbitraries.taxesState, async (state): Promise<void> => {
        const form = new TestForm(state)
        const tests: Array<[TaxYear, Information | undefined]> = [
          ['Y2019', state.Y2019],
          ['Y2020', state.Y2020],
          ['Y2021', state.Y2021]
        ]

        // Instead of Promise.all here, guarantee tests run sequentially.
        const res: Promise<void> = tests.reduce(async (p, [y, info]) => {
          await p

          form.setYear(y)

          return expect(await form.firstName()).toEqual(
            info?.taxPayer.primaryPerson?.firstName
          )
        }, Promise.resolve())

        form.cleanup()
        return res
      })
    )
  })
})
