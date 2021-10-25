import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import TaxPayer from 'ustaxes/components/TaxPayer'
import { FakePagerProvider } from '../common/FakePager'
import TestPage from '../common/Page'

export class TaxPayerTestPage extends TestPage {
  component: ReactElement = (
    <FakePagerProvider>
      <TaxPayer />
    </FakePagerProvider>
  )

  firstName = (): HTMLInputElement =>
    this.rendered().getByLabelText('First Name and Initial') as HTMLInputElement

  setFirstName = (name: string): void => {
    userEvent.type(this.firstName(), name)
  }

  saveButton = (): HTMLButtonElement =>
    this.rendered().getByRole('button', { name: /Save/i }) as HTMLButtonElement

  g = {
    foreignCountryBox: (): HTMLInputElement =>
      this.rendered().getByLabelText(
        'Do you have a foreign address?'
      ) as HTMLInputElement
  }

  errors = (): HTMLElement[] =>
    this.rendered().queryAllByText('Input is required')

  setIsForeignCountry = (value: boolean): void =>
    (value ? userEvent.click : userEvent.clear)(this.g.foreignCountryBox())
}
