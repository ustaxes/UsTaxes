import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import Menu, { drawerSections } from 'ustaxes/components/Menu'
import { resizeWindow, renderWithProviders } from 'ustaxes/testUtil'

const heading = drawerSections[0].title

describe('Menu', () => {
  beforeEach(() => {
    renderWithProviders(<Menu />)
  })
  it('renders', () => {
    expect(
      screen.getByRole('button', { name: /open drawer/ })
    ).toBeInTheDocument()
  })
  it('toggles open', async () => {
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })
  describe('mobile view', () => {
    beforeEach(async () => {
      await waitFor(() => resizeWindow(400, 900))
    })
    it('renders', async () => {
      expect(
        screen.queryByRole('heading', { name: heading })
      ).not.toBeInTheDocument()
    })
    it('closes with esc', async () => {
      userEvent.click(screen.getByRole('button', { name: /open drawer/ }))
      userEvent.type(screen.getByRole('heading', { name: heading }), '{esc}')
      const headingElement = await screen.queryByRole('heading', {
        name: heading
      })
      expect(headingElement).not.toBeInTheDocument()
    })
  })
})
