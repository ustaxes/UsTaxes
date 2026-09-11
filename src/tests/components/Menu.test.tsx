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
      expect(
        screen.getByText('Business income (Schedule C)')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Self-employment tax (Schedule SE)')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Form 7206 / Self-employed health insurance')
      ).toBeInTheDocument()
      expect(
        screen.getByText('Form 2555 / Foreign Earned Income Exclusion')
      ).toBeInTheDocument()

      const deductions = drawerSections.find(
        (section) => section.title === 'Deductions'
      )
      expect(deductions?.items.map((item) => item.title)).toEqual(
        expect.arrayContaining([
          'Adjustments to Income',
          'Form 2555 / Foreign Earned Income Exclusion',
          'Form 7206 / Self-employed health insurance'
        ])
      )
      expect(
        deductions?.items.findIndex(
          (item) => item.title === 'Form 2555 / Foreign Earned Income Exclusion'
        )
      ).toBeLessThan(
        deductions?.items.findIndex(
          (item) => item.title === 'Form 7206 / Self-employed health insurance'
        ) ?? -1
      )
    })
  })
})
