/* eslint @typescript-eslint/no-empty-function: "off" */

import { ReactElement } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import Questions from 'ustaxes/components/Questions'
import { InfoStore, createStoreUnpersisted } from 'ustaxes/redux/store'
import { questions } from 'ustaxes/data/questions'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { TaxesState } from 'ustaxes/redux/data'
import { blankState } from 'ustaxes/redux/reducer'
import TaxesStateMethods from 'ustaxes/redux/TaxesState'

afterEach(async () => {
  await waitFor(() => localStorage.clear())
  jest.resetAllMocks()
})

jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist')
  return {
    ...real,
    persistReducer: jest.fn().mockImplementation((config, reducers) => reducers)
  }
})

describe('Questions', () => {
  const navButtons = <PagerButtons submitText="Save" />

  const testComponent = (
    taxesState: TaxesState = { information: blankState }
  ): [InfoStore, ReactElement] => {
    const store = createStoreUnpersisted(taxesState)
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
      new TaxesStateMethods(store.getState()).info()?.questions.CRYPTO
    ).toEqual(true)
  })
})
