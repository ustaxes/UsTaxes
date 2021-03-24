import React, { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import SpouseAndDependent from './SpouseAndDependent'
import { store } from '../../redux/store'
import { PagerButtons, usePager } from '../pager'
import { allUrls } from '../Main'

describe('SpouseAndDependent', () => {
  it('renders with expected form labels and inputs', () => {
    const [, forward, prevUrl] = usePager(allUrls)

    const firstStepButtons: ReactElement = <PagerButtons previousUrl={prevUrl} submitText="Save and Continue" />
    render(
    <Provider store={store}>
      <SpouseAndDependent onAdvance={forward} navButtons={firstStepButtons} />
    </Provider>
    )

    screen.getByText('Spouse Information')
  })
})
