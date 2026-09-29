import { within } from '@testing-library/react'
import { ReactElement } from 'react'
import TaxPayer from 'ustaxes/components/TaxPayer'
import DomMethods from './DomMethods'

export default class TaxPayerMethods extends DomMethods {
  component: ReactElement = (<TaxPayer />)

  g = {
    foreignCountryBox: (): HTMLInputElement =>
      within(this.dom()).getByLabelText('Do you have a foreign address?')
  }

  setIsForeignCountry = async (value: boolean): Promise<void> => {
    if (value) {
      await this.user.click(this.g.foreignCountryBox())
    } else {
      await this.user.clear(this.g.foreignCountryBox())
    }
  }
}
