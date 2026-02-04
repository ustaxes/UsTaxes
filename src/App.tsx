import { ReactElement, useMemo } from 'react'
import Main from './components/Main'
import './App.css'
import { createTheme, ThemeProvider, useMediaQuery } from '@material-ui/core'

const App = (): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          secondary: prefersDarkMode
            ? {
                light: '#4f5b62',
                main: '#d5d5d5',
                dark: '#000a12',
                contrastText: '#ffffff'
              }
            : {
                light: '#4f5b62',
                main: '#263238',
                dark: '#000a12',
                contrastText: '#ffffff'
              },
          primary: {
            light: '#2E7D32',
            main: '#1B5E20',
            dark: '#0B3D0B',
            contrastText: '#F5F7F5'
          }
        }
      }),
    [prefersDarkMode]
  )

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
        <Main />
      </ThemeProvider>
    </div>
  )
}

export default App
