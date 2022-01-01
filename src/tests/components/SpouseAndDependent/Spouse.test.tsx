/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { store } from 'ustaxes/redux/store'
import log from 'ustaxes/core/log'
import { SpouseTestPage } from './Pages'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

beforeEach(() => {
  log.setLevel(log.levels.TRACE)
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

describe('SpouseInfo', () => {
  it('renders an `Add` button when no spouse has been added', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const spouseTest = spousePage.spouse

    // initial state has an add button
    expect(await spouseTest.addButton()).toBeInTheDocument()

    // initial state does not have any forms or labels
    expect(spouseTest.firstNameField()).not.toBeInTheDocument()
    expect(spouseTest.lastNameField()).not.toBeInTheDocument()
    expect(spouseTest.ssnField()).not.toBeInTheDocument()

    spousePage.cleanup()
  })

  it('renders form elements when `Add` button is clicked', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const spouseTest = spousePage.spouse
    userEvent.click(await spouseTest.addButton())

    // forms and labels appear after clicking the add button
    await waitFor(async () => {
      expect(spouseTest.firstNameField()).toBeInTheDocument()
      expect(spouseTest.lastNameField()).toBeInTheDocument()
      expect(spouseTest.ssnField()).toBeInTheDocument()
      expect(await spouseTest.saveButton()).toBeInTheDocument()
      expect(await spouseTest.closeButton()).toBeInTheDocument()
    })

    spousePage.cleanup()
  })

  it('saves and edits a spouse', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const { spouse } = spousePage

    await waitFor(async () =>
      expect(await spouse.addButton()).toBeInTheDocument()
    )

    userEvent.click(await spouse.addButton())

    // add values for each input
    userEvent.type(spouse.firstNameField()!, 'Sally K')
    userEvent.type(spouse.lastNameField()!, 'Ride')
    userEvent.clear(spouse.ssnField()!)
    userEvent.type(spouse.ssnField()!, '123456789')

    // click the save button
    userEvent.click(await spouse.saveButton())

    // expect first and last name to be concatenated
    expect(
      await spousePage.rendered().findByText('Sally K Ride')
    ).toBeInTheDocument()
    // expect ssn to appear with hyphens
    expect(spousePage.rendered().getByText('123-45-6789')).toBeInTheDocument()

    userEvent.click(await spouse.editButton())

    // expect the edit button to no longer be in the document
    await waitFor(() => expect(spouse.q.editButton()).not.toBeInTheDocument())

    // assert that the input values match what was entered
    expect(spouse.firstNameField()!.value).toBe('Sally K')
    expect(spouse.lastNameField()!.value).toBe('Ride')
    expect(spouse.ssnField()!.value).toBe('123-45-6789')

    // delete the old values and add new ones
    userEvent.type(spouse.firstNameField()!, '{selectall}{del}Fella')
    userEvent.type(spouse.lastNameField()!, '{selectall}{del}McGee')
    userEvent.clear(spouse.ssnField()!)
    userEvent.type(spouse.ssnField()!, '987-65-4321')

    // click the save button to save the new values
    userEvent.click(await spouse.saveButton())

    // expect the new names to be concatenated and new ssn to appear with hyphens
    expect(
      await spousePage.rendered().findByText('Fella McGee')
    ).toBeInTheDocument()
    expect(spousePage.rendered().getByText('987-65-4321')).toBeInTheDocument()

    // click the delete button
    userEvent.click((await spouse.deleteButtons())[0])

    // the add button is back
    expect(await spouse.addButton()).toBeInTheDocument()

    // expect input fields to not be in the document
    expect(spousePage.rendered().queryAllByRole('textbox')).toHaveLength(0)

    spousePage.cleanup()
  })

  it('does not save when required fields not completed', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const { spouse } = spousePage

    await waitFor(async () =>
      expect(await spouse.addButton()).toBeInTheDocument()
    )

    userEvent.click((await spouse.addButton())!)

    expect(await spouse.saveButton()).toBeInTheDocument()
    expect(await spouse.closeButton()).toBeInTheDocument()

    // click the save button with empty inputs
    userEvent.click(await spouse.saveButton())

    // expect three `Input is required` errors
    await waitFor(() => expect(spouse.requiredErrors()).toHaveLength(3))
    // fill in the first name incorrectly
    userEvent.type(spouse.firstNameField()!, 'F$LF(#)& ##3')
    userEvent.click(await spouse.saveButton())

    await waitFor(async () =>
      expect(await spouse.requiredErrors()).toHaveLength(2)
    )

    // fill in the first name correctly
    userEvent.type(spouse.firstNameField()!, '{selectall}{del}Sally K')
    userEvent.click(await spouse.saveButton())

    await waitFor(async () =>
      expect(await spouse.requiredErrors()).toHaveLength(2)
    )

    // add a name with restricted characters
    userEvent.type(spouse.lastNameField()!, 'R5$%84')
    userEvent.click(await spouse.saveButton())

    await waitFor(async () =>
      expect(await spouse.requiredErrors()).toHaveLength(1)
    )

    // correctly enter a last name
    userEvent.type(spouse.lastNameField()!, '{selectall}{del}Ride')
    userEvent.click(await spouse.saveButton())

    // only the ssn error remains
    expect(spouse.requiredErrors()).toHaveLength(1)

    // incorrectly enter ssn
    userEvent.clear(spouse.ssnField()!)
    userEvent.type(spouse.ssnField()!, '123sc')
    userEvent.click(await spouse.saveButton())

    expect(
      await spousePage
        .rendered()
        .findByText('Input should be filled with 9 digits')
    ).toBeInTheDocument()

    // clear ssn and add a valid value
    userEvent.clear(spouse.ssnField()!)
    userEvent.type(spouse.ssnField()!, '123456789')
    userEvent.click(await spouse.saveButton())

    // expect saved values to be formatted correctly
    expect(await spousePage.rendered().findByText('Sally K Ride'))
    expect(spousePage.rendered().getByText('123-45-6789'))

    // expect ssn error to be gone
    const ssnError = spousePage
      .rendered()
      .queryByText('Input should be filled with 9 digits')
    expect(ssnError).not.toBeInTheDocument()

    // delete the entry
    userEvent.click((await spouse.deleteButtons())[0])

    const inputsAfterDelete = spousePage.rendered().queryAllByRole('textbox')

    expect(inputsAfterDelete).toHaveLength(0)

    spousePage.cleanup()
  })
})
