import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import CreatePDF from 'ustaxes/components/createPDF'
import { Information } from 'ustaxes/core/data'
import { F1040Error } from 'ustaxes/forms/Y2020/irsForms/F1040'
import { blankState } from 'ustaxes/redux/reducer'
import { PagerTestPage } from '../common/FakePager'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as fc from 'fast-check'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

export default class CreatePDFTestPage extends PagerTestPage {
  component: ReactElement = (<CreatePDF />)
}

export const tests = {
  incompleteData: async (page: CreatePDFTestPage): Promise<void> => {
    await waitFor(() => expect(page.saveButton()).toBeInTheDocument())

    userEvent.click(page.saveButton())
  }
}

describe('CreatePDF Page', () => {
  const taxpayerComponent = (information: Information = blankState) =>
    new CreatePDFTestPage({
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

        await waitFor(async () =>
          expect(
            page.rendered().queryByText(F1040Error.filingStatusUndefined)
          ).toBeInTheDocument()
        )

        page.cleanup()
      })
    )
  })
})
