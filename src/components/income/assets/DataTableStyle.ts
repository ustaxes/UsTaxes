import { createStyles, makeStyles, Theme } from '@material-ui/core'
import { createTheme } from 'react-data-table-component'

type DarkModeProps = {
  prefersDarkMode: boolean
}

createTheme('normal', {
  backgroundColor: 'white',
  color: 'rgba(0, 0, 0, 0.54)',
  '& .MuiFilledInput-input': {
    fontSize: '.8rem',
    fontWeight: 'bold',
    padding: '0.9rem 0rem'
  }
})

createTheme(
  'dark',
  {
    backgroundColor: '#303030',
    color: 'white',
    '& .MuiFilledInput-input': {
      fontSize: '.8rem',
      fontWeight: 'bold',
      padding: '0.9rem 0rem'
    }
  },
  'normal'
)

export const baseCellStyle = (
  prefersDarkMode = false
): { [k: string]: string } => ({
  color: prefersDarkMode ? 'white' : 'rgba(0, 0, 0, 0.54)',
  backgroundColor: prefersDarkMode ? '#303030' : 'white'
})

export const useRowStyles = makeStyles<Theme, DarkModeProps>(() =>
  createStyles({
    disabledRow: {
      backgroundColor: '#aaaaaa',
      color: 'black'
    },
    normal: ({ prefersDarkMode }) => baseCellStyle(prefersDarkMode)
  })
)

export const columnInputStyles = makeStyles(() =>
  createStyles({
    column: {
      '& .MuiFilledInput-input': {
        fontSize: '.8rem',
        fontWeight: 'bold',
        padding: '0.9rem 0rem'
      }
    }
  })
)
