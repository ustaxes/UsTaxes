import { createStyles, makeStyles, Theme } from '@mui/material'

const useStyles = makeStyles(({ palette: { mode: themeType } }: Theme) =>
  createStyles({
    root: {
      '& .MuiFormLabel-root': {
        color:
          themeType === 'dark'
            ? 'rgba(255, 255, 255, 0.7)'
            : 'rgba(0, 0, 0, 0.54)'
      }
    }
  })
)

export default useStyles
