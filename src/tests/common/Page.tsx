import { TaxesState } from 'ustaxes/redux/data'
import { PropsWithChildren, ReactElement } from 'react'
import { createWholeStoreUnpersisted } from 'ustaxes/redux/store'
import { Provider } from 'react-redux'

const TestComponent = ({
  state,
  children
}: PropsWithChildren<{ state: TaxesState }>): ReactElement => {
  const store = createWholeStoreUnpersisted(state)

  return <Provider store={store}>{children}</Provider>
}

export { TestComponent }
