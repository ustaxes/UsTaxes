import { PersonMethods } from '../../common/PersonMethods'
import { within } from '@testing-library/react'
import DomMethods from '../../common/DomMethods'
import { FilingStatus } from 'ustaxes/core/data'

export class SpouseMethods extends PersonMethods {
  addButton = (): Promise<HTMLButtonElement> =>
    within(this.dom()).findByRole('button', {
      name: /Add/
    }) as Promise<HTMLButtonElement>

  q = {
    editButton: (): HTMLButtonElement | null =>
      within(this.dom()).queryByLabelText('edit') as HTMLButtonElement | null
  }

  editButton = async (): Promise<HTMLButtonElement> =>
    (await within(this.dom()).findByLabelText('edit')) as HTMLButtonElement
}

export class DependentMethods extends PersonMethods {
  addButton = (): Promise<HTMLButtonElement> =>
    within(this.dom()).findByRole('button', {
      name: /Add/
    }) as Promise<HTMLButtonElement>

  editButtons = (): Promise<HTMLButtonElement[]> =>
    within(this.dom()).findAllByLabelText('edit') as Promise<
      HTMLButtonElement[]
    >

  q = {
    isStudent: (): HTMLInputElement | null =>
      within(this.dom()).queryByText(
        'Is this person a full-time student?'
      ) as HTMLInputElement | null
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
    within(this.dom()).queryByRole('combobox') as HTMLSelectElement | null

  selected = (): FilingStatus | undefined =>
    this.dropdown()?.value as FilingStatus | undefined
}
