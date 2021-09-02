import { ReactElement } from 'react'
import {
  makeStyles,
  Link,
  Theme,
  Typography,
  useMediaQuery
} from '@material-ui/core'

type Props = {
  prefersDarkMode: boolean
}

const useStyles = makeStyles<Theme, Props>((theme: Theme) => ({
  root: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    left: 0,
    zIndex: 1201
  },
  container: {
    alignItems: 'center',
    display: 'flex',
    overflow: 'hidden'
  },
  main: ({ prefersDarkMode }) => ({
    '&:not(:focus)': {
      position: 'absolute',
      clip: 'rect(1px, 1px, 1px, 1px)',
      overflow: 'hidden',
      padding: 0
    },
    '&:focus': {
      borderRadius: 2,
      color: prefersDarkMode ? 'white' : 'rgba(0, 0, 0, 0.54)',
      backgroundColor: prefersDarkMode ? '#303030' : 'white',
      border: `1px solid ${theme.palette.primary.main}`,
      cursor: 'pointer',
      display: 'inline-block',
      margin: 12,
      minHeight: 32,
      textAlign: 'center',
      width: 130,
      padding: 12
    }
  })
}))

const SkipToLinks = (): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const classes = useStyles({ prefersDarkMode })

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <Link
          className={classes.main}
          tabIndex={0}
          onClick={() => {
            document.getElementsByTagName('main')[0].focus()
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              document.getElementsByTagName('main')[0].focus()
            }
          }}
        >
          <Typography>Skip to main content</Typography>
        </Link>
      </div>
    </div>
  )
}

export default SkipToLinks
