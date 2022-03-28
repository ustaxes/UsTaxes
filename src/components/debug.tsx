import { ReactElement } from 'react'
import { IconButton, makeStyles } from '@material-ui/core'
import { Star } from '@material-ui/icons'
import fc from 'fast-check'
import { useDispatch, YearsTaxesState } from 'ustaxes/redux'
import { setInfo } from 'ustaxes/redux/actions'
import { Information, TaxYears } from 'ustaxes/core/data'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import * as prand from 'pure-rand'
import { useSelector } from 'react-redux'

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
      >
        <Star />
        Seed random state
      </IconButton>
    </div>
  )
}
