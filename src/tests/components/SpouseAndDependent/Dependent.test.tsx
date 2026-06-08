/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { waitFor } from '@testing-library/react'
import { setupUserEvent, type UserEvent } from 'ustaxes/tests/userEventSetup'
import { store } from 'ustaxes/redux/store'
import log from 'ustaxes/core/log'
import { SpouseAndDependentTestPage } from './Pages'

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const labelMatcher = (label: string): RegExp =>
  new RegExp(`^${escapeRegExp(label)}`)

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

beforeAll(() => {
  log.setLevel(log.levels.TRACE)
})

let user: UserEvent

beforeEach(() => {
  user = setupUserEvent()
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

    await user.click(dependent.addButton()!)

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
          spouseAndDependent.rendered().getByText(labelMatcher(label))
        ).toBeInTheDocument()
      )
    })

    await user.click(spouseAndDependent.dependent.closeButton()!)

    // assert all the labels are now gone
    await waitFor(() => {
      dependentFormLabels.forEach((label) => {
        expect(
          spouseAndDependent.rendered().queryByText(labelMatcher(label))
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

    await user.click(dependent.addButton()!)

    await waitFor(() => {
      expect(dependent.firstNameField()).toBeInTheDocument()
    })

    expect(dependent.isStudent()).toBeInTheDocument()

    // add values for each input
    await user.type(dependent.firstNameField()!, 'Charlie')
    await user.type(dependent.lastNameField()!, 'Brown')
    await user.clear(dependent.ssnField()!)
    await user.type(dependent.ssnField()!, '222222222')
    await user.type(dependent.relationField()!, 'Son')
    await user.clear(dependent.dateOfBirthField()!)
    await user.type(dependent.dateOfBirthField()!, '01/01/2007')
    await user.type(dependent.durationField()!, '12')
    await user.click(dependent.isStudent()!)

    await user.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )

    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    await user.click(dependent.addButton()!)

    await waitFor(() => expect(dependent.isStudent()).toBeInTheDocument())

    await user.type(dependent.firstNameField()!, 'Sally')
    await user.type(dependent.lastNameField()!, 'Brown')
    await user.clear(dependent.ssnField()!)
    await user.type(dependent.ssnField()!, '333333333')
    await user.type(dependent.relationField()!, 'Daughter')
    await user.clear(dependent.dateOfBirthField()!)
    await user.type(dependent.dateOfBirthField()!, '03/01/2000')
    await user.type(dependent.durationField()!, '12')
    await user.click(dependent.isStudent()!)

    await user.click(dependent.saveButton()!)

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

    await user.click(deleteSally)

    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Sally Brown')
      ).not.toBeInTheDocument()
    )

    await user.click(deleteCharlie)
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

    await user.click(dependent.addButton()!)

    await waitFor(() => expect(dependent.firstNameField()).toBeInTheDocument())

    await user.type(dependent.firstNameField()!, 'Charlie')
    await user.type(dependent.lastNameField()!, 'Brown')
    await user.clear(dependent.ssnField()!)
    await user.type(dependent.ssnField()!, '222222222')
    await user.type(dependent.relationField()!, 'Son')
    await user.type(dependent.durationField()!, '12')
    await user.clear(dependent.dateOfBirthField()!)
    await user.type(dependent.dateOfBirthField()!, '09/11/2001')
    await user.click(dependent.isStudent()!)

    await user.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent.rendered().findByText('Charlie Brown')
      ).toBeInTheDocument()
    )
    expect(
      spouseAndDependent.rendered().getByText('222-22-2222')
    ).toBeInTheDocument()

    await user.click(dependent.addButton()!)

    await waitFor(() => expect(dependent.firstNameField()).toBeInTheDocument())
    await waitFor(() =>
      expect(dependent.dateOfBirthField()).toBeInTheDocument()
    )

    await user.type(dependent.firstNameField()!, 'Sally')
    await user.type(dependent.lastNameField()!, 'Brown')
    await user.clear(dependent.ssnField()!)
    await user.type(dependent.ssnField()!, '333333333')
    await user.type(dependent.relationField()!, 'Daughter')
    await user.type(dependent.durationField()!, '12')
    await user.clear(dependent.dateOfBirthField()!)
    await user.type(dependent.dateOfBirthField()!, '08/12/1999')
    await user.click(dependent.isStudent()!)
    await user.click(dependent.saveButton()!)

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
    await user.click(editCharlie)

    expect(dependent.firstNameField()!.value).toBe('Charlie')
    expect(dependent.lastNameField()!.value).toBe('Brown')
    expect(dependent.ssnField()!.value).toBe('222-22-2222')
    expect(dependent.relationField()!.value).toBe('Son')
    expect(dependent.durationField()!.value).toBe('12')
    expect(dependent.firstNameField()!.value).toBe('Charlie')
    expect(dependent.dateOfBirthField()!.value).toBe('09/11/2001')

    await user.type(dependent.firstNameField()!, '{selectall}{del}Deebo')
    await user.clear(dependent.ssnField()!)
    await user.type(dependent.ssnField()!, '777777777')

    await user.click(dependent.saveButton()!)

    await spouseAndDependent.rendered().findByText('Deebo Brown')
    await spouseAndDependent.rendered().findByText('777-77-7777')

    expect(dependent.deleteButtons()).toHaveLength(2)

    const [deleteDeebo, deleteSally] = dependent.deleteButtons()

    await user.click(deleteSally)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Sally Brown')
      ).not.toBeInTheDocument()
    )

    await user.click(deleteDeebo)
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

    await user.click(dependent.addButton()!)

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
          spouseAndDependent.rendered().getByText(labelMatcher(label))
        ).toBeInTheDocument()
      )
    })

    // click the save button with empty inputs
    await user.click(dependent.saveButton()!)

    // expect six `Input is required` errors
    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(6))

    await user.type(dependent.firstNameField()!, '8675309')
    await user.click(dependent.saveButton()!)

    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(5))

    await user.clear(dependent.firstNameField()!)
    await user.type(dependent.firstNameField()!, 'Booker T')
    await user.click(dependent.saveButton()!)

    await waitFor(() => {
      expect(dependent.requiredErrors()).toHaveLength(5)
    })

    await user.type(dependent.lastNameField()!, '{selectall}{del}Washington')
    await user.click(dependent.saveButton()!)

    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(4))

    await user.clear(dependent.ssnField()!)
    await user.type(dependent.ssnField()!, '123')
    await user.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should be filled with 9 digits')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(3)

    await user.clear(dependent.ssnField()!)
    await user.type(dependent.ssnField()!, '123456789')
    await user.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should be filled with 9 digits')
      ).not.toBeInTheDocument()
    )
    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(3))

    await user.type(dependent.relationField()!, '1111')
    await user.click(dependent.saveButton()!)

    await waitFor(async () =>
      expect(
        await spouseAndDependent
          .rendered()
          .findAllByText('Input should only include letters and spaces')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(2)

    await user.type(dependent.relationField()!, '{selectall}{del}stepchild')
    await user.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryByText('Input should only include letters and spaces')
      ).not.toBeInTheDocument()
    )

    expect(dependent.requiredErrors()).toHaveLength(2)

    await user.clear(dependent.dateOfBirthField()!)
    await user.type(dependent.dateOfBirthField()!, '31/12/2011')
    await user.click(dependent.saveButton()!)

    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(1))

    await waitFor(() => {
      const dateErr = spouseAndDependent
        .rendered()
        .queryAllByText('Invalid date format')
      expect(dateErr).toHaveLength(1)
    })

    await user.clear(dependent.dateOfBirthField()!)
    await user.type(dependent.dateOfBirthField()!, '01/01/2000')
    await user.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(spouseAndDependent.rendered().queryByText('Invalid date format'))
    )

    await user.type(dependent.durationField()!, 'abcd')
    await user.click(dependent.saveButton()!)

    await waitFor(() => expect(dependent.requiredErrors()).toHaveLength(1))

    await user.type(dependent.durationField()!, '{selectall}{del}15')
    await user.click(dependent.saveButton()!)

    await waitFor(() =>
      expect(
        spouseAndDependent
          .rendered()
          .queryAllByText('Input must be less than or equal to 12')
      ).toHaveLength(1)
    )

    expect(dependent.requiredErrors()).toHaveLength(0)

    await user.type(dependent.durationField()!, '{selectall}{del}10')
    await user.click(dependent.saveButton()!)

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
    await user.click(deleteBooker)
    await waitFor(() =>
      expect(
        spouseAndDependent.rendered().queryByText('Booker T Washington')
      ).not.toBeInTheDocument()
    )

    spouseAndDependent.cleanup()
  })
})
