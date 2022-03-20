import { ReactElement } from 'react'
import { styled } from '@mui/material/styles'
import { useScrollTrigger, Fab, Zoom } from '@mui/material'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'

const PREFIX = 'ScrollTop'

const classes = {
  root: `${PREFIX}-root`
}

const StyledZoom = styled(Zoom)(() => ({
  [`& .${classes.root}`]: {
    position: 'fixed',
    bottom: 2,
    right: 2
  }
}))

const ScrollTop = (): ReactElement => {
  const trigger = useScrollTrigger({
    target: window,
    disableHysteresis: true,
    threshold: 100
  })

  const handleClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <StyledZoom in={trigger}>
      <div onClick={handleClick} role="presentation" className={classes.root}>
        <Fab color="default" size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </div>
    </StyledZoom>
  )
}

export default ScrollTop
