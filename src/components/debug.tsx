import { ReactElement } from 'react'
import { IconButton } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { Star } from '@mui/icons-material'
import fc from 'fast-check'
import { useDispatch, YearsTaxesState } from 'ustaxes/redux'
import { setInfo } from 'ustaxes/redux/actions'
import { Information } from 'ustaxes/core/data'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as prand from 'pure-rand'
import { useSelector } from 'react-redux'
import { TaxYears } from 'ustaxes/data'

const useStyles = makeStyles(() => ({
  root: {
    position: 'absolute',
    top: '0px',
    right: '30px'
  },
  button: {}
}))

export const StateLoader = (): ReactElement => {
  if (process.env.NODE_ENV === 'production') {
    return <></>
  }
  const dispatch = useDispatch()
  const year = useSelector((state: YearsTaxesState) => state.activeYear)

  const classes = useStyles()

  const gen = new fc.Random(prand.mersenne(new Date().getMilliseconds()))

  const information = arbitraries.forYear(TaxYears[year]).information()

  const generator = (): Information =>
    information.noShrink().generate(gen).value

  return (
    <div className={classes.root}>
      <IconButton
        className={classes.button}
        onClick={() => dispatch(setInfo(generator()))}
        size="large"
      >
        <Star />
        Seed random state
      </IconButton>
    </div>
  )
}
