import React from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { SpouseInfo } from './SpouseAndDependent'
import { store } from '../../redux/store'

describe('SpouseInfo', () => {
  it('renders an `Add` button when no spouse has been added', () => {
    render(
    <Provider store={store}>
      <SpouseInfo />
    </Provider>
    )

    screen.getByRole('button', {
      name: /Add/
    })

    const firstNameLabel = screen.queryByLabelText('First Name and Initial')
    expect(firstNameLabel).not.toBeInTheDocument()

    const lastNameLabel = screen.queryByLabelText('Last Name')
    expect(lastNameLabel).not.toBeInTheDocument()

    const ssnLabel = screen.queryByLabelText('SSN / TIN')
    expect(ssnLabel).not.toBeInTheDocument()
  })
})
