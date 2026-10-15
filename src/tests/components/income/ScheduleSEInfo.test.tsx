import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { createStoreUnpersisted } from 'ustaxes/redux/store'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { blankState } from 'ustaxes/redux/reducer'
import ScheduleSEInfo from 'ustaxes/components/income/ScheduleSEInfo'
import { setupUserEvent } from 'ustaxes/tests/userEventSetup'
import { renderWithProviders } from 'ustaxes/testUtil'

describe('ScheduleSEInfo', () => {
  it('advances when Save and Continue is clicked', async () => {
    const onAdvance = jest.fn()
    const navButtons = <PagerButtons submitText="Save and Continue" />
    const user = setupUserEvent()
    const store = createStoreUnpersisted(blankState)

    renderWithProviders(
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance, navButtons }}>
          <ScheduleSEInfo />
        </PagerContext.Provider>
      </Provider>
    )

    await user.click(screen.getByRole('button', { name: 'Save and Continue' }))

    expect(onAdvance).toHaveBeenCalledTimes(1)
  })
})
