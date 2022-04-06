import { createStyles, makeStyles } from '@material-ui/core'
import { createTheme } from 'react-data-table-component'

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
