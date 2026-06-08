import { ReactElement } from 'react'
import { makeStyles, useScrollTrigger, Fab } from '@material-ui/core'
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2),
    opacity: 1,
    visibility: 'visible',
    pointerEvents: 'auto',
    transition: 'opacity 200ms ease-in-out, visibility 200ms ease-in-out'
  },
  hidden: {
    opacity: 0,
    visibility: 'hidden',
    pointerEvents: 'none'
  }
}))

const ScrollTop = (): ReactElement => {
  const classes = useStyles()
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100
  })

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div
      onClick={handleClick}
      role="presentation"
      className={`${classes.root} ${trigger ? '' : classes.hidden}`.trim()}
      aria-hidden={!trigger}
    >
      <Fab color="default" size="small" aria-label="scroll back to top">
        <KeyboardArrowUpIcon />
      </Fab>
    </div>
  )
}

export default ScrollTop
