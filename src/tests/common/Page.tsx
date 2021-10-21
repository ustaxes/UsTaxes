import { TaxesState } from 'ustaxes/redux/data'
import { ReactElement } from 'react'
import { createWholeStoreUnpersisted, InfoStore } from 'ustaxes/redux/store'
import { Provider } from 'react-redux'
import * as Queries from '@testing-library/dom/types/queries'
import { render, RenderResult } from '@testing-library/react'

export type TestRenderResult = RenderResult<typeof Queries, HTMLElement>

export abstract class TestPage {
  private _rendered: TestRenderResult | undefined
  private _baseElement: HTMLElement | undefined
  abstract component: ReactElement
  initialState: TaxesState
  store: InfoStore | undefined

  constructor(state: TaxesState) {
    this.initialState = state
  }

  rendered = (): TestRenderResult => {
    if (this._rendered === undefined) {
      // Attempt to fully isolate the rendered component
      // so that this rendered component may be safely
      // accessed asynchronously
      const baseElement: HTMLElement = document.createElement('div')
      document.getElementsByTagName('body')[0].appendChild(baseElement)
      this.store = createWholeStoreUnpersisted(this.initialState)
      const rendered = render(
        <Provider store={this.store}>{this.component}</Provider>,
        { baseElement }
      )
      this._baseElement = baseElement
      this._rendered = rendered
    }
    return this._rendered
  }

  cleanup = (): void => {
    this.store = undefined
    this._rendered?.unmount()
    this._rendered = undefined
    this._baseElement?.remove()
    this._baseElement = undefined
  }
}

export default TestPage
