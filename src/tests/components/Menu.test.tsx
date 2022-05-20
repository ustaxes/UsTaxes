import { screen } from '@testing-library/react'
import Menu, { drawerSections } from 'ustaxes/components/Menu'
import { renderWithProviders } from 'ustaxes/testUtil'
import { Provider } from 'react-redux'
import { createWholeStoreUnpersisted } from 'ustaxes/redux/store'
import { blankYearTaxesState } from 'ustaxes/redux'

const heading = drawerSections[0].title
const blankStore = createWholeStoreUnpersisted(blankYearTaxesState)

const component = (
  <Provider store={blankStore}>
    <Menu />
  </Provider>
)

describe('Menu', () => {
  describe('desktop view', () => {
    it('renders', () => {
      renderWithProviders(component)
      expect(screen.getByText(heading)).toBeInTheDocument()
    })
  })
})
