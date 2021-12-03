import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import TaxPayer from 'ustaxes/components/TaxPayer'
import { PagerTestPage } from '../common/FakePager'

export class TaxPayerTestPage extends PagerTestPage {
  component: ReactElement = (<TaxPayer />)

  firstName = (): HTMLInputElement =>
    this.rendered().getByLabelText('First Name and Initial') as HTMLInputElement

  setFirstName = (name: string): void => {
    userEvent.type(this.firstName(), name)
  }

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
