import * as fc from 'fast-check'
import { waitFor, render, RenderResult } from '@testing-library/react'
import * as Queries from '@testing-library/dom/types/queries'
import * as arbitraries from './arbitraries'
import { TestComponent } from './common/Page'
import TaxPayer from 'ustaxes/components/TaxPayer'
import YearDropDown from 'ustaxes/components/YearDropDown'
import { Information, TaxesState, TaxYear, TaxYears } from 'ustaxes/redux/data'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import _ from 'lodash'

afterEach(async () => {
  waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

abstract class Form {
  rendered: RenderResult<typeof Queries, HTMLElement> | undefined = undefined

  render = (element: ReactElement): void => {
    this.rendered = render(element)
  }

  cleanup = (): void => {
    if (this.rendered !== undefined) {
      this.rendered.unmount()
      this.rendered = undefined
    }
  }
}

const ensure = <A,>(result: A | null | undefined, msg: string): A => {
  if (result === undefined || result === null) {
    throw msg
  }
  return result
}

class TestForm extends Form {
  constructor(state: TaxesState) {
    super()
    this.render(
      <TestComponent state={state}>
        <YearDropDown />
        <TaxPayer />
      </TestComponent>
    )
  }

  byLabel = (lbl: string): HTMLElement =>
    ensure(_.head(this.rendered?.getAllByLabelText(lbl)), `${lbl} failed`)

  byLabelP = async (lbl: string): Promise<HTMLElement> =>
    ensure(
      _.head(await this.rendered?.findAllByLabelText(lbl)),
      `${lbl} not found`
    )

  yearSelect = (): HTMLElement => this.byLabel('Select TaxYear')

  yearSelectConfirm = (): HTMLButtonElement =>
    ensure(
      _.first(this.rendered?.getAllByText('Update')),
      'Year update button not found'
    ) as HTMLButtonElement

  setYear = (y: TaxYear): void => {
    userEvent.selectOptions(this.yearSelect(), y)
    userEvent.click(this.yearSelectConfirm())
  }

  firstName = async (): Promise<string | undefined> => {
    const f = await this.rendered?.findByLabelText('First Name and Initial')
    return f?.getAttribute('value') ?? undefined
  }
}

describe('years', () => {
  it('should switch data in taxpayer form', async () => {
    fc.assert(
      fc.asyncProperty(
        arbitraries.taxesState(),
        async (state): Promise<void> => {
          const form = new TestForm(state)
          const tests: Array<[TaxYear, Information | undefined]> = [
            [TaxYears.Y2019, state.Y2019],
            [TaxYears.Y2020, state.Y2020],
            [TaxYears.Y2021, state.Y2021]
          ]

          const res = await Promise.all(
            tests.map(async ([y, info]) =>
              waitFor(async () => {
                form.setYear(y)
                return expect(await form.firstName()).toEqual(
                  info?.taxPayer.primaryPerson?.firstName
                )
              })
            )
          )

          form.cleanup()
          return expect(res.length).toEqual(tests.length)
        }
      )
    )
  })
})
