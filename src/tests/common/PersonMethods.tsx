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

  initialField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(personLabels.initial)

  setInitial = (v: string): boolean => this.setIfAble(this.initialField(), v)

  lastNameField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(personLabels.lname)

  setLastName = (v: string): boolean => this.setIfAble(this.lastNameField(), v)

  ssnField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(personLabels.ssn)

  dateOfBirthField = (): HTMLInputElement | null =>
    // not sure why querying by label is not working.
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    within(this.dom()).queryByTestId('dateOfBirth')!.children[1]
      .children[0] as HTMLInputElement | null

  requiredErrors = (): HTMLElement[] =>
    within(this.dom()).queryAllByText('Input is required')

  dateOfBirthErrors = (): HTMLElement[] =>
    within(this.dom()).queryAllByText('Invalid Date Format')

  saveButton = (): HTMLButtonElement | null =>
    within(this.dom()).queryByRole('button', {
      name: /Save/
    })

  closeButton = (): HTMLButtonElement | null =>
    within(this.dom()).queryByRole('button', {
      name: /Discard/i
    })

  deleteButtons = (): HTMLButtonElement[] =>
    within(this.dom()).queryAllByRole('button', {
      name: /delete/
    })
}
