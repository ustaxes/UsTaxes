import { ReactElement } from 'react'
import { styled } from '@mui/material/styles'
import { IconButton } from '@mui/material'
import { Star } from '@mui/icons-material'
import fc from 'fast-check'
import { useDispatch, YearsTaxesState } from 'ustaxes/redux'
import { setInfo } from 'ustaxes/redux/actions'
import { Information } from 'ustaxes/core/data'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as prand from 'pure-rand'
import { useSelector } from 'react-redux'
import { TaxYears } from 'ustaxes/data'

const PREFIX = 'StateLoader'

const classes = {
  root: `${PREFIX}-root`,
  button: `${PREFIX}-button`
}

const Root = styled('div')(() => ({
  [`&.${classes.root}`]: {
    position: 'absolute',
    top: '0px',
    right: '30px'
  },

  [`& .${classes.button}`]: {}
}))

export const StateLoader = (): ReactElement => {
  if (process.env.NODE_ENV === 'production') {
    return <></>
  }
  const dispatch = useDispatch()
  const year = useSelector((state: YearsTaxesState) => state.activeYear)

  const gen = new fc.Random(prand.mersenne(new Date().getMilliseconds()))

  const information = arbitraries.forYear(TaxYears[year]).information()

  const generator = (): Information =>
    information.noShrink().generate(gen).value

  return (
    <Root className={classes.root}>
      <IconButton
        className={classes.button}
        onClick={() => dispatch(setInfo(generator()))}
        size="large"
      >
        <Star />
        Seed random state
      </IconButton>
    </Root>
  )
}
