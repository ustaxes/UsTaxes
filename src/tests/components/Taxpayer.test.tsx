import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Information } from 'ustaxes/redux/data'
import { blankState } from 'ustaxes/redux/reducer'
import TaxPayer from 'ustaxes/components/TaxPayer'
import { TestPage } from '../common/Page'
import { ReactElement } from 'react'
import { FakePagerProvider } from '../common/FakePager'

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

class TaxPayerTestPage extends TestPage {
  component: ReactElement = (
    <FakePagerProvider>
      <TaxPayer />
    </FakePagerProvider>
  )

  setFirstName = (name: string): void => {
    userEvent.type(
      this.rendered().getByLabelText('First Name and Initial'),
      name
    )
  }

  saveButton = (): HTMLButtonElement =>
    this.rendered().getByRole('button', { name: /Save/i }) as HTMLButtonElement

  g = {
    foreignCountryBox: (): HTMLInputElement =>
      this.rendered().getByLabelText(
        'Do you have a foreign address?'
      ) as HTMLInputElement
  }

  errors = async (): Promise<HTMLElement[]> =>
    await this.rendered().findAllByText('Input is required')

  setIsForeignCountry = (value: boolean): void =>
    (value ? userEvent.click : userEvent.clear)(this.g.foreignCountryBox())
}

describe('Taxpayer', () => {
  const taxpayerComponent = (information: Information = blankState) =>
    new TaxPayerTestPage({ information })

  it('should show errors if incomplete data is entered', async () => {
    const page = taxpayerComponent()

    page.setFirstName('Bob')
    userEvent.click(page.saveButton())

    expect(await page.errors()).not.toHaveLength(0)
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
