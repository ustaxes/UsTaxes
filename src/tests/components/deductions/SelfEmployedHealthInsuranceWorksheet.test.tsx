import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import SelfEmployedHealthInsuranceWorksheetInfo from 'ustaxes/components/deductions/SelfEmployedHealthInsuranceWorksheet'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { Information } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import { createStoreUnpersisted } from 'ustaxes/redux/store'
import { renderWithProviders } from 'ustaxes/testUtil'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'

describe('SelfEmployedHealthInsuranceWorksheet', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('prefills line 4 from Schedule C when a stored worksheet line 4 value is blank', async () => {
    const info: Information = {
      ...blankState,
      businesses: [
        {
          name: 'Side Gig',
          principalBusinessOrProfession: 'Consulting',
          income: {
            grossReceipts: 12000,
            returnsAndAllowances: 500,
            otherIncome: 250
          },
          expenses: {
            advertising: 300,
            office: 450
          },
          homeOfficeDeduction: 750
        }
      ],
      adjustments: {
        selfEmployedHealthInsuranceWorksheet: {
          line1: 900,
          line4: '' as unknown as number
        }
      }
    }
    const store = createStoreUnpersisted(info)
    const user = setupUserEvent()
    const onAdvance = jest.fn()
    const navButtons = <PagerButtons submitText="Save and Continue" />

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance, navButtons }}>
          <SelfEmployedHealthInsuranceWorksheetInfo />
        </PagerContext.Provider>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('10,250')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    await waitFor(() => {
      const state = store.getState()
      expect(
        state[state.activeYear].adjustments
          ?.selfEmployedHealthInsuranceWorksheet?.line4
      ).toBe(10250)
    })

    expect(onAdvance).toHaveBeenCalledTimes(1)
  })
})
