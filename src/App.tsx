import React, { ReactElement } from 'react'
import Main from './components/Main'
import './App.css'
import { ViewportProvider } from './hooks/Viewport'

const App = (): ReactElement => (
  <div className="App">
    <ViewportProvider>
      <Main />
    </ViewportProvider>
  </div>
)

export default App
