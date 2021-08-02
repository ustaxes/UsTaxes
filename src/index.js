import React from 'react'
import { hydrate, render } from 'react-dom'
import { Provider } from 'react-redux'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter } from 'react-router-dom'

import { store, persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'

const component = (
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<h1>Loading from Local Storage</h1>}
        persistor={persistor}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>
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
