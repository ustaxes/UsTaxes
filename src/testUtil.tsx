import React, { ReactElement } from 'react'
import { render, RenderResult } from '@testing-library/react'

import { BrowserRouter as Router } from 'react-router-dom'
import { ViewportProvider } from 'ustaxes/hooks/Viewport'

export const resizeWindow = (x: number, y: number): void => {
  global.innerWidth = x
  global.innerHeight = y
  window.dispatchEvent(new Event('resize'))
}

export const renderWithProviders = (ui: ReactElement): RenderResult =>
  render(
    <Router>
      <ViewportProvider>{ui}</ViewportProvider>
    </Router>
  )
