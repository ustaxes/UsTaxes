/* eslint @typescript-eslint/no-empty-function: "off" */

import { ReactElement } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import Questions from 'ustaxes/components/Questions'
import { InfoStore, createStoreUnpersisted } from 'ustaxes/redux/store'
import { questions } from 'ustaxes/core/data/questions'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { Information } from 'ustaxes/core/data'
import { blankState } from 'ustaxes/redux/reducer'
import TaxesStateMethods from 'ustaxes/redux/TaxesState'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.mock('redux-persist', () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const real = jest.requireActual('redux-persist')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...real,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

describe('Questions', () => {
  const navButtons = <PagerButtons submitText="Save" />

  const testComponent = (
    info: Information = blankState
  ): [InfoStore, ReactElement] => {
    const store = createStoreUnpersisted(info)
    const component = (
      <Provider store={store}>
        <PagerContext.Provider value={{ onAdvance: () => {}, navButtons }}>
          <Questions />
        </PagerContext.Provider>
      </Provider>
    )

    return [store, component]
  }

  const cryptoQuestion = questions.find((q) => q.tag === 'CRYPTO')

  if (cryptoQuestion === undefined) {
    throw new Error('crypto question undefined')
  }

  it('should always show crypto question', async () => {
    const [, component] = testComponent()
    const result = render(component)
    const questionComponent = await result.findAllByText(cryptoQuestion.text)
    expect(questionComponent[0]).toBeInTheDocument()
  })

  it('should propagate to model', async () => {
    const [store, component] = testComponent()
    const result = render(component)
    const checkBoxes = await result.findAllByRole('checkbox')
    const save = await result.findByRole('button', { name: /Save/ })
    checkBoxes.forEach((b) => fireEvent.click(b))
    fireEvent.click(save)

    await waitFor(() => {})
    expect(
      new TaxesStateMethods(store.getState()).info().questions.CRYPTO
    ).toEqual(true)
  })
})
