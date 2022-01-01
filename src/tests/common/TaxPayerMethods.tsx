import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReactElement } from 'react'
import TaxPayer from 'ustaxes/components/TaxPayer'
import DomMethods from './DomMethods'

export default class TaxPayerMethods extends DomMethods {
  component: ReactElement = (<TaxPayer />)

  g = {
    foreignCountryBox: (): HTMLInputElement =>
      within(this.dom()).getByLabelText(
        'Do you have a foreign address?'
      ) as HTMLInputElement
  }

  setIsForeignCountry = (value: boolean): void =>
    (value ? userEvent.click : userEvent.clear)(this.g.foreignCountryBox())
}
