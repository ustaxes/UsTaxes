import { PersonMethods } from '../../common/PersonMethods'
import { within } from '@testing-library/react'
import DomMethods from '../../common/DomMethods'
import { FilingStatus } from 'ustaxes/core/data'

export class SpouseMethods extends PersonMethods {
  addButton = (): HTMLButtonElement | null =>
    within(this.dom()).queryByRole('button', {
      name: /Add/
    })

  editButton = (): HTMLButtonElement | null =>
    within(this.dom()).queryByLabelText('edit')
}

export class DependentMethods extends PersonMethods {
  relationField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText('Relationship to Taxpayer')

  durationField = (): HTMLInputElement | null =>
    within(this.dom()).queryByLabelText(/How many months/)

  isStudent = (): HTMLInputElement | null =>
    within(this.dom()).queryByText('Is this person a full-time student?')

  addButton = (): HTMLButtonElement | null =>
    within(this.dom()).queryByRole('button', {
      name: /Add/
    })

  editButtons = (): HTMLButtonElement[] =>
    within(this.dom()).queryAllByLabelText('edit')
}

export class FilingStatusMethods extends DomMethods {
  options = (): FilingStatus[] =>
    within(this.dom())
      .getAllByRole('option')
      .flatMap((x) => {
        const v = x.getAttribute('value') as FilingStatus | null
        return v === null ? [] : [v]
      })

  dropdown = (): HTMLSelectElement | null =>
    within(this.dom()).queryByRole('combobox')

  selected = (): FilingStatus | undefined =>
    this.dropdown()?.value as FilingStatus | undefined
}
