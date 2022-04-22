import { PersonMethods } from '../../common/PersonMethods'
import { within } from '@testing-library/react'
import DomMethods from '../../common/DomMethods'
import { FilingStatus } from 'ustaxes/core/data'

export class SpouseMethods extends PersonMethods {
  addButton = (): Promise<HTMLButtonElement> =>
    within(this.dom()).findByRole('button', {
      name: /Add/
    })

  q = {
    editButton: (): HTMLButtonElement | null =>
      within(this.dom()).queryByLabelText('edit')
  }

  editButton = async (): Promise<HTMLButtonElement> =>
    await within(this.dom()).findByLabelText('edit')
}

export class DependentMethods extends PersonMethods {
  addButton = (): Promise<HTMLButtonElement> =>
    within(this.dom()).findByRole('button', {
      name: /Add/
    })

  editButtons = (): Promise<HTMLButtonElement[]> =>
    within(this.dom()).findAllByLabelText('edit')

  q = {
    isStudent: (): HTMLInputElement | null =>
      within(this.dom()).queryByText('Is this person a full-time student?')
  }
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
