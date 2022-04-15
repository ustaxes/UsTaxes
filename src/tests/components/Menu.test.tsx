import userEvent from '@testing-library/user-event'
import { screen, waitFor } from '@testing-library/react'
import Menu, { drawerSections } from 'ustaxes/components/Menu'
import { resizeWindow, renderWithProviders } from 'ustaxes/testUtil'
import { Provider } from 'react-redux'
import { createWholeStoreUnpersisted } from 'ustaxes/redux/store'
import { blankYearTaxesState } from 'ustaxes/redux'

const heading = drawerSections[0].title
const blankStore = createWholeStoreUnpersisted(blankYearTaxesState)
describe('Menu', () => {
  describe('desktop view', () => {
    it('renders', () => {
      renderWithProviders(
        <Provider store={blankStore}>
          <Menu />
        </Provider>
      )
      expect(screen.getByText(heading)).toBeInTheDocument()
    })
  })
  describe.skip('mobile view', () => {
    beforeEach(async () => {
      await waitFor(() => resizeWindow(400, 900))
      renderWithProviders(<Menu />)
    })
    it('renders', async () => {
      expect(
        screen.queryByRole('button', { name: /close drawer/i })
      ).not.toBeInTheDocument()
    })
    it('toggles open', async () => {
      userEvent.click(screen.getByRole('button', { name: /open drawer/i }))

      expect(
        await screen.queryByRole('button', { name: /open drawer/i })
      ).not.toBeInTheDocument()
    })
    it('closes with menu', async () => {
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
