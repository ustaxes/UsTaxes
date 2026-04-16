import { labels as personLabels } from 'ustaxes/components/TaxPayer/PersonFields'
import { within } from '@testing-library/react'
import DomMethods from './DomMethods'

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const labelMatcher = (label: string): RegExp => new RegExp(escapeRegExp(label))

export class PersonMethods extends DomMethods {
  firstNameField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(labelMatcher(personLabels.fname))

  setIfAble = async (
    f: HTMLInputElement | null,
    v: string
  ): Promise<boolean> => {
    if (f !== null) {
      await this.user.type(f, v)
      return true
    }
    return false
  }

  setFirstName = async (v: string): Promise<boolean> =>
    this.setIfAble(this.firstNameField(), v)

  lastNameField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(labelMatcher(personLabels.lname))

  setLastName = async (v: string): Promise<boolean> =>
    this.setIfAble(this.lastNameField(), v)

  ssnField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(/SSN\s*\/\s*TIN/i)

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
