import { YearsTaxesState } from 'ustaxes/redux'
import { ReactElement } from 'react'
import { createWholeStoreUnpersisted, InfoStore } from 'ustaxes/redux/store'
import { Provider } from 'react-redux'
import * as Queries from '@testing-library/dom/types/queries'
import { RenderResult } from '@testing-library/react'
import { renderWithProviders } from 'ustaxes/testUtil'

export type TestRenderResult = RenderResult<typeof Queries, HTMLElement>

export abstract class TestPage {
  private _rendered: TestRenderResult | undefined
  private _baseElement: HTMLElement | undefined
  abstract component: ReactElement
  initialState: YearsTaxesState
  store: InfoStore

  constructor(state: YearsTaxesState) {
    this.initialState = state
    this.store = createWholeStoreUnpersisted(state)
  }

  renderComponent(): ReactElement {
    return <Provider store={this.store}>{this.component}</Provider>
  }

  rendered = (): TestRenderResult => {
    if (this._rendered === undefined) {
      // Attempt to fully isolate the rendered component
      // so that this rendered component may be safely
      // accessed asynchronously
      const baseElement: HTMLElement = document.createElement('div')
      document.getElementsByTagName('body')[0].appendChild(baseElement)
      const rendered = renderWithProviders(this.renderComponent(), {
        baseElement
      })
      rendered.debug(undefined, Infinity)
      this._baseElement = baseElement
      this._rendered = rendered
    }
    return this._rendered
  }

  allFieldNames = (): string[] =>
    this.rendered()
      .getAllByRole('textbox')
      .flatMap((x) => {
        const name = x.getAttribute('name')
        return name !== null ? [name] : []
      })

  cleanup = (): void => {
    this._rendered?.unmount()
    this._rendered = undefined
    this._baseElement?.remove()
    this._baseElement = undefined
  }
}

/**
 * Attempts to help with the cryptic error messages that can be
 * thrown out by `waitFor`.
 * @param makePage
 * @returns
 */
export const withPage =
  <P extends TestPage>(makePage: (state: YearsTaxesState) => P) =>
  (state: YearsTaxesState) =>
  async (f: (page: P) => Promise<boolean | undefined>): Promise<boolean> => {
    try {
      const page = makePage(state)
      try {
        const res = await f(page).catch((e) => {
          console.info('Error caught in handling promise.')
          console.info(e)
          console.info(page.rendered().container.innerHTML)
          page.cleanup()
          throw e
        })

        page.cleanup()
        return res ?? true
      } catch (e) {
        console.info('Error caught in handling outer.')
        console.info(e)
        console.info(page.rendered().container.innerHTML)
        page.cleanup()
        throw e
      }
    } catch (e) {
      console.error('Caught exception')
      console.info(state)
      throw e
    }
  }

export default TestPage
