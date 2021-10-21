import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Information } from 'ustaxes/redux/data'
import { blankState } from 'ustaxes/redux/reducer'
import { TaxPayerTestPage } from './TaxPayerTestPage'

jest.setTimeout(1000 * 60 * 10)

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

describe('Taxpayer', () => {
  const taxpayerComponent = (information: Information = blankState) =>
    new TaxPayerTestPage({ Y2020: information, activeYear: 'Y2020' })

  it('should show errors if incomplete data is entered', async () => {
    const page = taxpayerComponent()

    page.setFirstName('Bob')
    userEvent.click(page.saveButton())

    waitFor(async () => expect(await page.errors()).not.toHaveLength(0))
    page.cleanup()
  })

  it('checkbox should open foreign country fields', () => {
    const page = taxpayerComponent()

    const allFieldNames = (): string[] =>
      page
        .rendered()
        .getAllByRole('textbox')
        .flatMap((x) => {
          const name = x.getAttribute('name')
          return name !== null ? [name] : []
        })

    expect(allFieldNames()).not.toContain('address.province')
    expect(allFieldNames()).toContain('address.zip')

    page.setIsForeignCountry(true)
    expect(allFieldNames()).toContain('address.province')
    expect(allFieldNames()).not.toContain('address.zip')
    page.cleanup()
  })
})
