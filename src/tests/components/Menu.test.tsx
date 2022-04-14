import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import Menu, { drawerSections } from 'ustaxes/components/Menu'
import { resizeWindow, renderWithProviders } from 'ustaxes/testUtil'

const heading = drawerSections[0].title

describe('Menu', () => {
  describe('desktop view', () => {
    it('renders', () => {
      renderWithProviders(<Menu />)
      expect(screen.getByText(heading)).toBeInTheDocument()
    })
  })
  describe.skip('mobile view', () => {
    beforeEach(async () => {
      await waitFor(() => resizeWindow(400, 900))
      renderWithProviders(<Menu />)
    })
    it('renders', () => {
      expect(
        screen.queryByRole('button', { name: /close drawer/i })
      ).not.toBeInTheDocument()
    })
    it('toggles open', () => {
      userEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      expect(
        screen.queryByRole('button', { name: /open drawer/i })
      ).not.toBeInTheDocument()
    })
    it('closes with menu', () => {
      userEvent.click(screen.getByRole('button', { name: /open drawer/i }))
      userEvent.click(
        screen.getByRole('button', {
          name: /close drawer/i,
          hidden: true
        })
      )

      expect(
        screen.queryByRole('button', { name: /close drawer/i })
      ).not.toBeInTheDocument()
    })
  })
})
