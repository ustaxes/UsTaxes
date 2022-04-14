import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import CreatePDF from 'ustaxes/components/CreatePDF'
import { Information } from 'ustaxes/core/data'
import { F1040Error } from 'ustaxes/forms/errors'
import { blankState } from 'ustaxes/redux/reducer'
import { FakePagerProvider, PagerMethods } from '../common/FakePager'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as fc from 'fast-check'
import TestPage from '../common/Page'
import { blankYearTaxesState, YearsTaxesState } from 'ustaxes/redux'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.setTimeout(10000)

export default class CreatePDFTestPage extends TestPage {
  pager: PagerMethods
  constructor(state: YearsTaxesState) {
    super(state)
    this.pager = new PagerMethods(() => this.rendered().container)
  }

  component: ReactElement = (
    <FakePagerProvider>
      <CreatePDF />
    </FakePagerProvider>
  )
}

export const tests = {
  incompleteData: async ({ pager }: CreatePDFTestPage): Promise<void> => {
    await waitFor(() => expect(pager.saveButton()).toBeInTheDocument())

    userEvent.click(pager.saveButton())
  }
}

describe('CreatePDF Page', () => {
  const taxpayerComponent = (information: Information = blankState) =>
    new CreatePDFTestPage({
      ...blankYearTaxesState,
      Y2020: information,
      activeYear: 'Y2020'
    })

  it('should show no data error if no data is entered', async () => {
    const page = taxpayerComponent()

    await waitFor(() =>
      expect(
        page.rendered().queryByText('No data entered yet')
      ).toBeInTheDocument()
    )

    page.cleanup()
  })

  it('should show filing status error if some data is entered', async () => {
    const information = arbitraries.forYear(2020).information()
    await fc.assert(
      fc.asyncProperty(information, async (info) => {
        info.taxPayer.filingStatus = undefined

        const page = taxpayerComponent(info)

        await waitFor(() =>
          expect(
            page.rendered().queryByText(F1040Error.filingStatusUndefined)
          ).toBeInTheDocument()
        )

        page.cleanup()
      })
    )
  })
})
