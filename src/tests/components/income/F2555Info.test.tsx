import { screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import F2555Info from 'ustaxes/components/income/F2555Info'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { blankState } from 'ustaxes/redux/reducer'
import { createStoreUnpersisted } from 'ustaxes/redux/store'
import { renderWithProviders } from 'ustaxes/testUtil'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'

describe('F2555Info', () => {
  it('saves the Form 2555 line 45 amount into other income', async () => {
    const onAdvance = jest.fn()
    const navButtons = <PagerButtons submitText="Save and Continue" />
    const user = setupUserEvent()
    const store = createStoreUnpersisted(blankState)

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance, navButtons }}>
          <F2555Info />
        </PagerContext.Provider>
      </Provider>
    )

    await user.type(
      screen.getByRole('textbox', {
        name: /foreign earned income exclusion/i
      }),
      '1234'
    )
    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    await waitFor(() => {
      expect(onAdvance).toHaveBeenCalledTimes(1)
      const state = store.getState()
      expect(
        state[state.activeYear].otherIncome?.foreignEarnedIncomeExclusion
      ).toBe(1234)
    })
  })

  it('clears Form 2555 when the amount is left blank', async () => {
    const onAdvance = jest.fn()
    const navButtons = <PagerButtons submitText="Save and Continue" />
    const user = setupUserEvent()
    const store = createStoreUnpersisted({
      ...blankState,
      otherIncome: { foreignEarnedIncomeExclusion: 1500 }
    })

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance, navButtons }}>
          <F2555Info />
        </PagerContext.Provider>
      </Provider>
    )

    const input = screen.getByRole('textbox', {
      name: /foreign earned income exclusion/i
    })
    await user.clear(input)
    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    await waitFor(() => {
      expect(onAdvance).toHaveBeenCalledTimes(1)
      const state = store.getState()
      expect(state[state.activeYear].otherIncome).toBeUndefined()
    })
  })
})
