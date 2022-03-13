import { ReactElement } from 'react'
import { makeStyles, useScrollTrigger, Fab, Zoom } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: theme.spacing(2),
    right: theme.spacing(2)
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
    <Zoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        <Fab color="default" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </div>
    </Zoom>
  )
}

export default ScrollTop
