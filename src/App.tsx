import { ReactElement, useMemo } from 'react'
import Main from './components/Main'
import './App.css'
import { createTheme, ThemeProvider } from '@material-ui/core'

const App = (): ReactElement => {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: {
            light: '#294b6a',
            main: '#1b3a57',
            dark: '#102538',
            contrastText: '#ffffff'
          },
          secondary: {
            light: '#4f5b62',
            main: '#263238',
            dark: '#000a12',
            contrastText: '#ffffff'
          },
          background: {
            default: '#f4f6fb',
            paper: '#ffffff'
          }
        },
        typography: {
          fontFamily:
            '"IBM Plex Sans", "Segoe UI", "Helvetica Neue", sans-serif',
          fontSize: 13
        },
        overrides: {
          MuiButton: {
            root: {
              textTransform: 'none',
              fontWeight: 600
            }
          },
          MuiInputBase: {
            root: {
              fontSize: 13
            }
          },
          MuiListItem: {
            root: {
              paddingTop: 6,
              paddingBottom: 6
            }
          },
          MuiTableCell: {
            root: {
              fontSize: 12
            }
          }
        }
      }),
    []
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
