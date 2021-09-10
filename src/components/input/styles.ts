import { createStyles, makeStyles, Theme } from '@material-ui/core'

const useStyles = makeStyles(({ palette: { type: themeType } }: Theme) =>
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
