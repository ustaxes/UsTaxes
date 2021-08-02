import React, { ReactElement } from 'react'
import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'

import { createStoreUnpersisted } from '../../redux/store'
import { PagerButtons, PagerContext } from '../../components/pager'
import { Information } from '../../redux/data'
import { blankState } from '../../redux/reducer'
import TaxPayer from '../../components/TaxPayer'
import userEvent from '@testing-library/user-event'

jest.setTimeout(1000 * 60 * 10)

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

describe('Taxpayer', () => {
  const navButtons = <PagerButtons submitText="save" />

  const testComponent = (
    info: Information | undefined = blankState
  ): ReactElement => {
    const store = createStoreUnpersisted(info)
    const component = (
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance: () => {}, navButtons }}>
          <TaxPayer />
        </PagerContext.Provider>
      </Provider>
    )

    return component
  }

  it('checkbox should open foreign country fields', () => {
    const component = testComponent()
    const result = render(component)

    const allFieldNames = (): string[] =>
      result.getAllByRole('textbox').flatMap((x) => {
        const name = x.getAttribute('name')
        return name !== null ? [name] : []
      })

    expect(allFieldNames()).not.toContain('address.province')
    expect(allFieldNames()).toContain('address.zip')

    const foreignCountry = result
      .getAllByRole('checkbox')
      .find((x) => x.getAttribute('name') === 'isForeignCountry')
    if (foreignCountry !== undefined) {
      userEvent.click(foreignCountry)
      expect(allFieldNames()).toContain('address.province')
      expect(allFieldNames()).not.toContain('address.zip')
    }
    expect(foreignCountry).not.toBeUndefined()
  })
})
