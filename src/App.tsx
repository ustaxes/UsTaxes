import { ReactElement, useMemo } from 'react'
import Main from './components/Main'
import './App.css'
import {
  createTheme,
  StyledEngineProvider,
  ThemeProvider
} from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'

const App = (): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
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
            light: '#66ffa6',
            main: '#00e676',
            dark: '#00b248',
            contrastText: '#000000'
          }
        }
      }),
    [prefersDarkMode]
  )

  return (
    <div className="App">
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Main />
        </ThemeProvider>
      </StyledEngineProvider>
    </div>
  )
}

export default App
