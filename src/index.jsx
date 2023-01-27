import { StrictMode } from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import App from './App'
import * as serviceWorker from './serviceWorker'
import { BrowserRouter as Router } from 'react-router-dom'

import { store, persistor } from './redux/store'
import { PersistGate } from 'redux-persist/integration/react'

import './index.css'

ReactDOM.render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate
        loading={<h1>Loading from Local Storage</h1>}
        persistor={persistor}
      >
        <Router>
          <App />
        </Router>
      </PersistGate>
    </Provider>
  </StrictMode>,
  document.getElementById('app')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
