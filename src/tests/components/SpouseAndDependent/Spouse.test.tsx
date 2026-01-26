/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { store } from 'ustaxes/redux/store'
import log from 'ustaxes/core/log'
import { SpouseTestPage } from './Pages'
import 'ustaxes/tests/userEventSetup'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

beforeEach(() => {
  log.setLevel(log.levels.TRACE)
})

let user: ReturnType<typeof userEvent.setup>

beforeEach(() => {
  user = userEvent.setup()
})

jest.setTimeout(30000)

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

describe('SpouseInfo', () => {
  it('renders an `Add` button when no spouse has been added', () => {
    const spousePage = new SpouseTestPage(store.getState())
    const spouseTest = spousePage.spouse

    // initial state has an add button
    expect(spouseTest.addButton()).toBeInTheDocument()

    // initial state does not have any forms or labels
    expect(spouseTest.firstNameField()).not.toBeInTheDocument()
    expect(spouseTest.lastNameField()).not.toBeInTheDocument()
    expect(spouseTest.ssnField()).not.toBeInTheDocument()

    spousePage.cleanup()
  })

  it('renders form elements when `Add` button is clicked', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const spouseTest = spousePage.spouse
    await user.click(spouseTest.addButton()!)

    // forms and labels appear after clicking the add button
    await waitFor(() => {
      expect(spouseTest.firstNameField()).toBeInTheDocument()
      expect(spouseTest.lastNameField()).toBeInTheDocument()
      expect(spouseTest.ssnField()).toBeInTheDocument()
      expect(spouseTest.saveButton()).toBeInTheDocument()
      expect(spouseTest.closeButton()).toBeInTheDocument()
    })

    spousePage.cleanup()
  })

  it('saves and edits a spouse', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const { spouse } = spousePage

    await waitFor(() => expect(spouse.addButton()).toBeInTheDocument())

    await user.click(spouse.addButton()!)

    // add values for each input
    await user.type(spouse.firstNameField()!, 'Sally K')
    await user.type(spouse.lastNameField()!, 'Ride')

    await waitFor(() => expect(spouse.dateOfBirthField()).toBeInTheDocument())

    await user.clear(spouse.dateOfBirthField()!)
    await user.type(spouse.dateOfBirthField()!, '12311988')

    await user.clear(spouse.ssnField()!)
    await user.type(spouse.ssnField()!, '123456789')

    // click the save button
    await user.click(spouse.saveButton()!)

    // expect first and last name to be concatenated
    expect(
      await spousePage.rendered().findByText('Sally K Ride')
    ).toBeInTheDocument()
    // expect ssn to appear with hyphens
    expect(spousePage.rendered().getByText('123-45-6789')).toBeInTheDocument()

    await user.click(spouse.editButton()!)

    // expect the edit button to no longer be in the document
    await waitFor(() => expect(spouse.editButton()).not.toBeInTheDocument())

    // assert that the input values match what was entered
    expect(spouse.firstNameField()!.value).toBe('Sally K')
    expect(spouse.lastNameField()!.value).toBe('Ride')
    expect(spouse.ssnField()!.value).toBe('123456789')

    // delete the old values and add new ones
    await user.type(spouse.firstNameField()!, '{selectall}{del}Fella')
    await user.type(spouse.lastNameField()!, '{selectall}{del}McGee')
    await user.clear(spouse.ssnField()!)
    await user.type(spouse.ssnField()!, '987-65-4321')

    // click the save button to save the new values
    await user.click(spouse.saveButton()!)

    // expect the new names to be concatenated and new ssn to appear with hyphens
    expect(
      await spousePage.rendered().findByText('Fella McGee')
    ).toBeInTheDocument()
    expect(spousePage.rendered().getByText('987-65-4321')).toBeInTheDocument()

    // click the delete button
    await user.click(spouse.deleteButtons()[0])

    // the add button is back
    expect(spouse.addButton()).toBeInTheDocument()

    // expect input fields to not be in the document
    expect(spousePage.rendered().queryAllByRole('textbox')).toHaveLength(0)

    spousePage.cleanup()
  })

  it('does not save when required fields not completed', async () => {
    const spousePage = new SpouseTestPage(store.getState())
    const { spouse } = spousePage

    await waitFor(() => expect(spouse.addButton()).toBeInTheDocument())

    await user.click(spouse.addButton()!)

    expect(spouse.saveButton()!).toBeInTheDocument()
    expect(spouse.closeButton()).toBeInTheDocument()

    // click the save button with empty inputs
    await user.click(spouse.saveButton()!)

    // expect four `Input is required` errors (including date input)
    await waitFor(() => expect(spouse.requiredErrors()).toHaveLength(4))

    // fill in the first name incorrectly
    await user.type(spouse.firstNameField()!, 'F$LF(#)& ##3')
    await user.click(spouse.saveButton()!)

    await waitFor(() => expect(spouse.requiredErrors()).toHaveLength(3))

    // fill in the first name correctly
    await user.type(spouse.firstNameField()!, '{selectall}{del}Sally K')
    await user.click(spouse.saveButton()!)

    await waitFor(() => expect(spouse.requiredErrors()).toHaveLength(3))

    // add a name with restricted characters
    await user.type(spouse.lastNameField()!, 'R5$%84')
    await user.click(spouse.saveButton()!)

    await waitFor(() => expect(spouse.requiredErrors()).toHaveLength(2))

    // correctly enter a last name
    await user.type(spouse.lastNameField()!, '{selectall}{del}Ride')
    await user.click(spouse.saveButton()!)

    expect(spouse.requiredErrors()).toHaveLength(2)

    await user.clear(spouse.dateOfBirthField()!)
    await user.type(spouse.dateOfBirthField()!, '12/31/1989')

    // only ssn error remains
    expect(spouse.requiredErrors()).toHaveLength(1)

    // incorrectly enter ssn
    await user.clear(spouse.ssnField()!)
    await user.type(spouse.ssnField()!, '123sc')
    await user.click(spouse.saveButton()!)

    expect(
      await spousePage
        .rendered()
        .findByText('Input should be 9 digits (###-##-####) or NRA')
    ).toBeInTheDocument()

    // clear ssn and add a valid value
    await user.clear(spouse.ssnField()!)
    await user.type(spouse.ssnField()!, '123456789')
    await user.click(spouse.saveButton()!)

    await user.clear(spouse.dateOfBirthField()!)
    await user.type(spouse.dateOfBirthField()!, '03011989')

    // expect saved values to be formatted correctly
    expect(await spousePage.rendered().findByText('Sally K Ride'))
    expect(spousePage.rendered().getByText('123-45-6789'))

    // expect ssn error to be gone
    expect(
      spousePage
        .rendered()
        .queryByText('Input should be 9 digits (###-##-####) or NRA')
    ).not.toBeInTheDocument()

    // delete the entry
    await user.click(spouse.deleteButtons()[0])

    const inputsAfterDelete = spousePage.rendered().queryAllByRole('textbox')

    expect(inputsAfterDelete).toHaveLength(0)

    spousePage.cleanup()
  })
})
