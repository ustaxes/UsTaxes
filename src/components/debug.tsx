import { ReactElement } from 'react'
import { IconButton, makeStyles } from '@material-ui/core'
import { Star } from '@material-ui/icons'
import fc from 'fast-check'
import { useDispatch } from 'ustaxes/redux'
import { setInfo } from 'ustaxes/redux/actions'
import { Information, TaxesState } from 'ustaxes/redux/data'
import { information } from 'ustaxes/tests/arbitraries'
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
  const activeYear = useSelector((state: TaxesState) => state.activeYear)

  const classes = useStyles()

  const gen = new fc.Random(prand.mersenne(new Date().getMilliseconds()))

  const generator = (): Information =>
    information(activeYear).noShrink().generate(gen).value

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
