import { StrictMode } from 'react'
import { hydrate, render } from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router } from 'react-router-dom'

import { store, persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { ViewportProvider } from './hooks/Viewport'
import { LastLocationProvider } from 'react-router-last-location'

import './index.css'

const component = (
  <StrictMode>
    <ViewportProvider>
      <Provider store={store}>
        <PersistGate
          loading={<h1>Loading from Local Storage</h1>}
          persistor={persistor}
        >
          <Router>
            <LastLocationProvider>
              <App />
            </LastLocationProvider>
          </Router>
        </PersistGate>
      </Provider>
    </ViewportProvider>
  </StrictMode>
)

const rootElement = document.getElementById('root')

if (rootElement.hasChildNodes()) {
  hydrate(component, rootElement)
} else {
  render(component, rootElement)
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
