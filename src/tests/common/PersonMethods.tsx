import { labels as personLabels } from 'ustaxes/components/TaxPayer/PersonFields'
import { within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DomMethods from './DomMethods'

export class PersonMethods extends DomMethods {
  firstNameField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(personLabels.fname)

  setIfAble = (f: HTMLInputElement | null, v: string): boolean => {
    if (f !== null) {
      userEvent.type(f, v)
      return true
    }
    return false
  }

  setFirstName = (v: string): boolean =>
    this.setIfAble(this.firstNameField(), v)

  lastNameField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(personLabels.lname)

  setLastName = (v: string): boolean => this.setIfAble(this.lastNameField(), v)

  ssnField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(personLabels.ssn)

  requiredErrors = (): HTMLElement[] =>
    within(this.dom()).queryAllByText('Input is required')

  saveButton = async (): Promise<HTMLButtonElement> =>
    await within(this.dom()).findByRole('button', {
      name: /Save/
    })

  closeButton = async (): Promise<HTMLButtonElement> =>
    await within(this.dom()).findByRole('button', {
      name: /Discard/i
    })

  deleteButtons = async (): Promise<HTMLButtonElement[]> =>
    await within(this.dom()).findAllByRole('button', {
      name: /delete/
    })
}
