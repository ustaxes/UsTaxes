/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { store } from 'ustaxes/redux/store'
import log from 'ustaxes/core/log'
import { SpouseAndDependentTestPage } from './Pages'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

beforeAll(() => {
  log.setLevel(log.levels.TRACE)
})

jest.setTimeout(10000)

jest.mock('redux-persist', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const real = jest.requireActual('redux-persist')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...real,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

describe('Dependents', () => {
  it('renders an empty dependent list initially', () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const { spouse, dependent } = spouseAndDependent

    // Both spouse and dependent add buttons should appear
    expect(dependent.addButton()).toBeInTheDocument()
    expect(spouse.addButton()).toBeInTheDocument()

    // initial state does not have forms or labels
    expect(dependent.firstNameField()).not.toBeInTheDocument()
    expect(dependent.lastNameField()).not.toBeInTheDocument()
    expect(dependent.ssnField()).not.toBeInTheDocument()

    spouseAndDependent.cleanup()
  })

  it('renders dependent form element when add button is clicked', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const { spouse, dependent } = spouseAndDependent

    await waitFor(() => {
      expect(spouse.addButton()).toBeInTheDocument()
      expect(dependent.addButton()).toBeInTheDocument()
    })

    userEvent.click(dependent.addButton()!)

    const dependentFormLabels = [
      'First Name and Initial',
      'Last Name',
      'SSN / TIN',
      'Relationship to Taxpayer',
      'Date of Birth',
      'How many months did you live together this year?',
      'Is this person a full-time student?'
    ]

    // Assert all form labels appear
    await waitFor(() => {
      dependentFormLabels.forEach((label) =>
        expect(
          spouseAndDependent.rendered().getByText(label)
        ).toBeInTheDocument()
      )
    })

    userEvent.click(spouseAndDependent.dependent.closeButton()!)

    // assert all the labels are now gone
    await waitFor(() => {
      dependentFormLabels.forEach((label) => {
        expect(
          spouseAndDependent.rendered().queryByText(label)
        ).not.toBeInTheDocument()
      })
    })

    spouseAndDependent.cleanup()
  })

  it('saves multiple dependents', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const dependent = spouseAndDependent.dependent

    await waitFor(() => {
      expect(dependent.addButton()).toBeInTheDocument()
    })

    userEvent.click(dependent.addButton()!)

    await waitFor(() => {
      expect(dependent.firstNameField()).toBeInTheDocument()
    })

    expect(dependent.isStudent()).toBeInTheDocument()

    // add values for each input
    userEvent.type(dependent.firstNameField()!, 'Charlie')
    userEvent.type(dependent.lastNameField()!, 'Brown')
    userEvent.clear(dependent.ssnField()!)
    userEvent.type(dependent.ssnField()!, '222222222')
    userEvent.type(dependent.relationField()!, 'Son')
    userEvent.clear(dependent.dateOfBirthField()!)
    userEvent.type(dependent.dateOfBirthField()!, '01/01/2007')
    userEvent.type(dependent.durationField()!, '12')
    userEvent.click(dependent.isStudent()!)

    userEvent.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    userEvent.click(dependent.addButton()!)

    await waitFor(() => expect(dependent.isStudent()).toBeInTheDocument())

    userEvent.type(dependent.firstNameField()!, 'Sally')
    userEvent.type(dependent.lastNameField()!, 'Brown')
    userEvent.clear(dependent.ssnField()!)
    userEvent.type(dependent.ssnField()!, '333333333')
    userEvent.type(dependent.relationField()!, 'Daughter')
    userEvent.clear(dependent.dateOfBirthField()!)
    userEvent.type(dependent.dateOfBirthField()!, '03/01/2000')
    userEvent.type(dependent.durationField()!, '12')
    userEvent.click(dependent.isStudent()!)

    userEvent.click(dependent.saveButton()!)

    await waitFor(async () => {
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    })

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()
    await waitFor(() => {
      expect(
        spouseAndDependent.rendered().getByText('Sally Brown')
      ).toBeInTheDocument()
    })
    expect(
      spouseAndDependent.rendered().getByText('333-33-3333')
    ).toBeInTheDocument()

    expect(dependent.deleteButtons()).toHaveLength(2)

    const [deleteCharlie, deleteSally] = dependent.deleteButtons()

    userEvent.click(deleteSally)

    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Sally Brown')
      ).not.toBeInTheDocument()
    )

    userEvent.click(deleteCharlie)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Charlie Brown')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })

  it('saves and edits multiple dependents', async (): Promise<void> => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const dependent = spouseAndDependent.dependent

    await waitFor(() => {
      expect(dependent.addButton()).toBeInTheDocument()
    })

    userEvent.click(dependent.addButton()!)

    await waitFor(() => expect(dependent.firstNameField()).toBeInTheDocument())

    userEvent.type(dependent.firstNameField()!, 'Charlie')
    userEvent.type(dependent.lastNameField()!, 'Brown')
    userEvent.clear(dependent.ssnField()!)
    userEvent.type(dependent.ssnField()!, '222222222')
    userEvent.type(dependent.relationField()!, 'Son')
    userEvent.type(dependent.durationField()!, '12')
    userEvent.clear(dependent.dateOfBirthField()!)
    userEvent.type(dependent.dateOfBirthField()!, '09/11/2001')
    userEvent.click(dependent.isStudent()!)

    userEvent.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )
    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    userEvent.click(dependent.addButton()!)

    await waitFor(() => expect(dependent.firstNameField()).toBeInTheDocument())
    await waitFor(() =>
      expect(dependent.dateOfBirthField()).toBeInTheDocument()
    )

    userEvent.type(dependent.firstNameField()!, 'Sally')
    userEvent.type(dependent.lastNameField()!, 'Brown')
    userEvent.clear(dependent.ssnField()!)
    userEvent.type(dependent.ssnField()!, '333333333')
    userEvent.type(dependent.relationField()!, 'Daughter')
    userEvent.type(dependent.durationField()!, '12')
    userEvent.clear(dependent.dateOfBirthField()!)
    userEvent.type(dependent.dateOfBirthField()!, '08/12/1999')
    userEvent.click(dependent.isStudent()!)
    userEvent.click(dependent.saveButton()!)

    expect(
      spouseAndDependent.rendered().queryByText('Input is required')
    ).not.toBeInTheDocument()

    await waitFor(() => expect(dependent.dateOfBirthErrors()).toHaveLength(0))

    await waitFor(async () => {
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
      expect(
        spouseAndDependent.rendered().getByText('222-22-2222')
      ).toBeInTheDocument()
      expect(
        spouseAndDependent.rendered().getByText('Sally Brown')
      ).toBeInTheDocument()
      expect(
        spouseAndDependent.rendered().getByText('333-33-3333')
      ).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(dependent.editButtons()).toHaveLength(2)
    })

    const editCharlie = dependent.editButtons()[0]
    userEvent.click(editCharlie)

    expect(dependent.firstNameField()!.value).toBe('Charlie')
    expect(dependent.lastNameField()!.value).toBe('Brown')
    expect(dependent.ssnField()!.value).toBe('222-22-2222')
    expect(dependent.relationField()!.value).toBe('Son')
    expect(dependent.durationField()!.value).toBe('12')
    expect(dependent.firstNameField()!.value).toBe('Charlie')
    expect(dependent.dateOfBirthField()!.value).toBe('09/11/2001')

    userEvent.type(dependent.firstNameField()!, '{selectall}{del}Deebo')
    userEvent.clear(dependent.ssnField()!)
    userEvent.type(dependent.ssnField()!, '777777777')

    userEvent.click(dependent.saveButton()!)

    await spouseAndDependent.rendered().findByText('Deebo Brown')
    await spouseAndDependent.rendered().findByText('777-77-7777')

    expect(dependent.deleteButtons()).toHaveLength(2)

    const [deleteDeebo, deleteSally] = dependent.deleteButtons()

    userEvent.click(deleteSally)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Sally Brown')
      ).not.toBeInTheDocument()
    )

    userEvent.click(deleteDeebo)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Deebo Brown')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })

  it('renders appropriate input errors', async () => {
    const spouseAndDependent = new SpouseAndDependentTestPage(store.getState())
    const dependent = spouseAndDependent.dependent

    await waitFor(() => expect(dependent.addButton()).toBeInTheDocument())

    userEvent.click(dependent.addButton()!)

    const labels = [
      'First Name and Initial',
      'Last Name',
      'SSN / TIN',
      'Relationship to Taxpayer',
      'Date of Birth',
      'How many months did you live together this year?',
      'Is this person a full-time student?'
    ]
    // Assert all form labels appear
    await waitFor(() => {
      labels.forEach((label) =>
        expect(
          spouseAndDependent.rendered().getByText(label)
        ).toBeInTheDocument()
      )
    })

    // click the save button with empty inputs
    userEvent.click(dependent.saveButton()!)

    // expect five `Input is required` errors
    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(5))

    userEvent.type(dependent.firstNameField()!, '8675309')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() => {
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()

      expect(dependent.requiredErrors()).toHaveLength(4)
    })

    userEvent.clear(dependent.firstNameField()!)
    userEvent.type(dependent.firstNameField()!, 'Booker T')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() => {
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()

      expect(dependent.requiredErrors()).toHaveLength(4)
    })

    userEvent.type(dependent.lastNameField()!, '666')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(3)

    userEvent.type(dependent.lastNameField()!, '{selectall}{del}Washington')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )
    expect(dependent.requiredErrors()).toHaveLength(3)

    userEvent.clear(dependent.ssnField()!)
    userEvent.type(dependent.ssnField()!, '123')
    userEvent.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should be filled with 9 digits')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(2)

    userEvent.clear(dependent.ssnField()!)
    userEvent.type(dependent.ssnField()!, '123456789')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should be filled with 9 digits')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(2)

    userEvent.type(dependent.relationField()!, '1111')
    userEvent.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should only include letters and spaces')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(1)

    userEvent.type(dependent.relationField()!, '{selectall}{del}stepchild')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(1)

    userEvent.clear(dependent.dateOfBirthField()!)
    userEvent.type(dependent.dateOfBirthField()!, '31/12/2011')
    userEvent.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findAllByText('Input is required')
      ).toHaveLength(1)
    )

    await waitFor(() => {
      const dateErr = spouseAndDependent
        .rendered()
        .queryAllByText('Invalid date format')
      expect(dateErr).toHaveLength(1)
    })

    userEvent.type(dependent.dateOfBirthField()!, '{selectall}{del}01/01/2000')
    userEvent.click(dependent.saveButton()!)

    expect(dependent.requiredErrors()).toHaveLength(1)

    userEvent.type(dependent.durationField()!, 'abcd')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(1))

    userEvent.type(dependent.durationField()!, '{selectall}{del}15')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryAllByText('Input must be less than or equal to 12')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(0)

    userEvent.type(dependent.durationField()!, '{selectall}{del}10')
    userEvent.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input must be less than or equal to 12')
      ).not.toBeInTheDocument()
    )
    expect(dependent.requiredErrors()).toHaveLength(0)

    await spouseAndDependent.rendered().findByText('Booker T Washington')
    expect(
      spouseAndDependent.rendered().getByText('123-45-6789')
    ).toBeInTheDocument()

    const deleteBooker = dependent.deleteButtons()[0]
    userEvent.click(deleteBooker)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Booker T Washington')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })
})
