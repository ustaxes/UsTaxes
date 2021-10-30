import { TaxesState } from 'ustaxes/redux/data'
import { PropsWithChildren, ReactElement } from 'react'
import { createStoreUnpersisted } from 'ustaxes/redux/store'
import { Provider } from 'react-redux'
import * as Queries from '@testing-library/dom/types/queries'
import { render, RenderResult } from '@testing-library/react'

export type TestRenderResult = RenderResult<typeof Queries, HTMLElement>

const TestComponent = ({
  state,
  children
}: PropsWithChildren<{ state: TaxesState }>): ReactElement => {
  const store = createStoreUnpersisted(state)

  return <Provider store={store}>{children}</Provider>
}

export abstract class TestPage {
  private _rendered: TestRenderResult | undefined
  abstract component: ReactElement
  initialState: TaxesState

  constructor(state: TaxesState) {
    this.initialState = state
  }

  rendered = (): TestRenderResult => {
    if (this._rendered === undefined) {
      this._rendered = render(
        <TestComponent state={this.initialState}>
          {this.component}
        </TestComponent>
      )
    }
    return this._rendered
  }

  cleanup = (): void => {
    this.rendered().unmount()
  }
}

export { TestComponent }
