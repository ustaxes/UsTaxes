import { render, waitFor } from '@testing-library/react'

import { Information, TaxYears } from 'ustaxes/redux/data'
import { blankState } from 'ustaxes/redux/reducer'
import TaxPayer from 'ustaxes/components/TaxPayer'
import userEvent from '@testing-library/user-event'
import { TestComponent } from '../common/Page'

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
  const taxpayerComponent = (info: Information = blankState) => (
    <TestComponent state={{ Y2020: info, activeYear: TaxYears.Y2020 }}>
      <TaxPayer />
    </TestComponent>
  )

  it('checkbox should open foreign country fields', () => {
    const component = taxpayerComponent()
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
