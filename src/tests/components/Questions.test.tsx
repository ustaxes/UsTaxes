/* eslint @typescript-eslint/no-empty-function: "off" */

import { ReactElement } from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import Questions from 'ustaxes/components/Questions'
import { InfoStore, createStoreUnpersisted } from 'ustaxes/redux/store'
import { questions } from 'ustaxes/data/questions'
import { create1040 } from 'ustaxes/irsForms/Main'
import { isRight } from '../../util'
import * as fc from 'fast-check'
import * as arbitraries from 'ustaxes/tests/arbitraries'
import { PagerButtons, PagerContext } from 'ustaxes/components/pager'
import { Information } from 'ustaxes/redux/data'
import { blankState } from 'ustaxes/redux/reducer'

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
    info: Information | undefined = blankState
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
    expect(store.getState().information.questions.CRYPTO).toBeTruthy()
  })

  it('should propagate to 1040', async () => {
    return await fc.assert(
      fc.asyncProperty(arbitraries.information, async (info) => {
        const f1040 = create1040(info)

        if (isRight(f1040)) {
          expect(f1040.right[0].virtualCurrency).toEqual(
            info.questions.CRYPTO ?? false
          )
        } else {
          expect(f1040.left).toEqual([])
        }
        return await Promise.resolve(true)
      })
    )
  })
})
