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
          type: prefersDarkMode ? 'dark' : 'light',
          background: {
            default: prefersDarkMode ? '#303030' : '#fafafa',
            paper: prefersDarkMode ? '#37474f' : '#ffffff'
          },
          text: {
            primary: prefersDarkMode ? '#ffffff' : '#000000',
            secondary: prefersDarkMode
              ? 'rgba(255, 255, 255, 0.75)'
              : 'rgba(0, 0, 0, 0.7)'
          },
          secondary: prefersDarkMode
            ? {
                light: '#4f5b62',
                main: '#cfd8dc',
                dark: '#455a64',
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
