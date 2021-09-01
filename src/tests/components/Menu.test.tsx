import userEvent from '@testing-library/user-event'
import {
  screen,
  waitFor,
  waitForElementToBeRemoved
} from '@testing-library/react'
import Menu, { drawerSections } from 'ustaxes/components/Menu'
import { resizeWindow, renderWithProviders } from 'ustaxes/testUtil'

const heading = drawerSections[0].title

describe('Menu', () => {
  beforeEach(() => {
    renderWithProviders(<Menu />)
  })
  it('renders', () => {
    expect(screen.getByRole('heading', { name: heading })).toBeInTheDocument()
  })
  describe('mobile view', () => {
    beforeEach(async () => {
      await waitFor(() => resizeWindow(400, 900))
    })
    it('renders', async () => {
      await waitForElementToBeRemoved(() =>
        screen.queryByRole('heading', { name: heading })
      )
      expect(
        screen.queryByRole('heading', { name: heading })
      ).not.toBeInTheDocument()
    })
    it('toggles open', async () => {
      userEvent.click(screen.getByRole('button', { name: /open drawer/ }))

      expect(
        await screen.getByRole('heading', { name: heading })
      ).toBeInTheDocument()
    })
    it('closes with menu', async () => {
      userEvent.click(screen.getByRole('button', { name: /open drawer/ }))
      const menuButton = screen.getByRole('button', { name: /close drawer/ })
      userEvent.click(menuButton)

      waitForElementToBeRemoved(() =>
        expect(
          screen.queryByRole('heading', {
            name: heading
          })
        ).not.toBeInTheDocument()
      )
    })
  })
})
