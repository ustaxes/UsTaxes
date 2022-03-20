import { ReactElement } from 'react'
import { styled } from '@mui/material/styles'
import { Link, Typography, useMediaQuery } from '@mui/material'
const PREFIX = 'SkipToLinks'

const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
  main: `${PREFIX}-main`
}

const Root = styled('div')(({ theme }) => ({
  [`&.${classes.root}`]: {
    position: 'absolute',
    display: 'flex',
    top: 0,
    left: 0,
    zIndex: 1201
  },

  [`& .${classes.container}`]: {
    alignItems: 'center',
    display: 'flex',
    overflow: 'hidden'
  },

  [`& .${classes.main}`]: {
    '&:not(:focus)': {
      position: 'absolute',
      clip: 'rect(1px, 1px, 1px, 1px)',
      overflow: 'hidden',
      padding: 0
    },
    '&:focus': {
      borderRadius: 2,
      color: 'rgba(0, 0, 0, 0.54)',
      backgroundColor: 'white',
      border: `1px solid ${theme.palette.primary.main}`,
      cursor: 'pointer',
      display: 'inline-block',
      margin: 12,
      minHeight: 32,
      textAlign: 'center',
      width: 130,
      padding: 12
    }
  },
  [`& .${classes.main} .dark`]: {
    '&:focus': {
      color: 'white',
      backgroundColor: '#303030'
    }
  }
}))

const SkipToLinks = (): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <Root className={`${classes.root} ${prefersDarkMode ? 'dark' : ''}`}>
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
    </Root>
  )
}

export default SkipToLinks
