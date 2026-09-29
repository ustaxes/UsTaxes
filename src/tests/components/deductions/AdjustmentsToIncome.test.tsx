import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import AdjustmentsToIncome from 'ustaxes/components/deductions/AdjustmentsToIncome'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { Information } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import { createStoreUnpersisted } from 'ustaxes/redux/store'
import { renderWithProviders } from 'ustaxes/testUtil'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'

describe('AdjustmentsToIncome', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('advances when optional fields are left blank', async () => {
    const onAdvance = jest.fn()
    const store = createStoreUnpersisted(blankState)
    const user = setupUserEvent()

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider
          value={{
            onAdvance,
            navButtons: <PagerButtons submitText="Save and Continue" />
          }}
        >
          <AdjustmentsToIncome />
        </PagerContext.Provider>
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    await waitFor(() => {
      expect(onAdvance).toHaveBeenCalledTimes(1)
      const state = store.getState()
      expect(state[state.activeYear].adjustments).toBeUndefined()
    })
  })

  it('normalizes formatted persisted deduction values on no-edit submit', async () => {
    const onAdvance = jest.fn()
    const info: Information = {
      ...blankState,
      adjustments: {
        selfEmployedHealthInsuranceDeduction: '$775' as unknown as number,
        selfEmployedHealthInsuranceWorksheet: {
          line14: '$775' as unknown as number
        }
      }
    }
    const store = createStoreUnpersisted(info)
    const user = setupUserEvent()

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider
          value={{
            onAdvance,
            navButtons: <PagerButtons submitText="Save and Continue" />
          }}
        >
          <AdjustmentsToIncome />
        </PagerContext.Provider>
      </Provider>
    )

    await waitFor(() => {
      expect(screen.getByDisplayValue('775')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    await waitFor(() => {
      expect(onAdvance).toHaveBeenCalledTimes(1)
      const state = store.getState()
      expect(
        state[state.activeYear].adjustments
          ?.selfEmployedHealthInsuranceDeduction
      ).toBe(775)
      expect(
        state[state.activeYear].adjustments
          ?.selfEmployedHealthInsuranceWorksheet?.line14
      ).toBe(775)
    })
  })
})
