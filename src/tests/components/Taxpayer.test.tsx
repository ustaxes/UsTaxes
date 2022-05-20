import { waitFor } from '@testing-library/react'
import { BrowserRouter as Router } from 'react-router-dom'
import TaxPayer from 'ustaxes/components/TaxPayer'
import { Information } from 'ustaxes/core/data'
import { blankYearTaxesState, YearsTaxesState } from 'ustaxes/redux'
import { blankState } from 'ustaxes/redux/reducer'
import { FakePagerProvider, PagerMethods } from '../common/FakePager'
import TestPage from '../common/Page'
import { PersonMethods } from '../common/PersonMethods'
import TaxPayerMethods from '../common/TaxPayerMethods'

jest.setTimeout(1000 * 60 * 10)

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.mock('redux-persist', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const real = jest.requireActual('redux-persist')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...real,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    persistReducer: jest.fn().mockImplementation((_, reducers) => reducers)
  }
})

class TaxPayerTestPage extends TestPage {
  taxPayer: TaxPayerMethods
  person: PersonMethods
  pager: PagerMethods

  constructor(state: YearsTaxesState) {
    super(state)
    const dom = () => this.rendered().getByTestId('taxpayer')

    this.taxPayer = new TaxPayerMethods(dom)
    this.person = new PersonMethods(dom)
    this.pager = new PagerMethods(dom)
  }

  component = (
    <Router>
      <FakePagerProvider>
        <div data-testid="taxpayer">
          <TaxPayer />
        </div>
      </FakePagerProvider>
    </Router>
  )
}

interface Person {
  person: PersonMethods
}
interface Pager {
  pager: PagerMethods
}

interface TaxPayer {
  taxPayer: TaxPayerMethods
}

export const tests = {
  incompleteData: async ({ person, pager }: Person & Pager): Promise<void> => {
    person.setFirstName('Bob')
    await waitFor(() => expect(pager.saveButton()).toBeInTheDocument())

    pager.save()

    await waitFor(() => expect(person.requiredErrors()).not.toHaveLength(0))
  },
  checkboxForeignCountryFields: async (
    page: TestPage & TaxPayer
  ): Promise<void> => {
    expect(page.allFieldNames()).not.toContain('address.province')
    expect(page.allFieldNames()).toContain('address.zip')

    page.taxPayer.setIsForeignCountry(true)
    await waitFor(() => {
      expect(page.allFieldNames()).toContain('address.province')
      expect(page.allFieldNames()).not.toContain('address.zip')
    })
  }
}

describe('Taxpayer', () => {
  const taxpayerComponent = (information: Information = blankState) =>
    new TaxPayerTestPage({
      ...blankYearTaxesState,
      Y2020: information,
      activeYear: 'Y2020'
    })

  it('should show errors if incomplete data is entered', async () => {
    const page = taxpayerComponent()

    await tests.incompleteData(page)

    page.cleanup()
  })

  it('checkbox should open foreign country fields', async () => {
    const page = taxpayerComponent()

    await tests.checkboxForeignCountryFields(page)

    page.cleanup()
  })
})
