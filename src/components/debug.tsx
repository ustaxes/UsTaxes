import React, { ReactElement } from 'react'
import { IconButton, makeStyles } from '@material-ui/core'
import { Star } from '@material-ui/icons'
import fc from 'fast-check'
import { useDispatch } from 'react-redux'
import { setEntireState } from 'ustaxes/redux/actions'
import { TaxesState } from 'ustaxes/redux/data'
import { taxesState } from 'ustaxes/tests/arbitraries'
import * as prand from 'pure-rand'

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

  const classes = useStyles()

  const gen = new fc.Random(prand.mersenne(new Date().getMilliseconds()))

  const generator = (): TaxesState => taxesState.noShrink().generate(gen).value

  return (
    <div className={classes.root}>
      <IconButton
        className={classes.button}
        onClick={() => dispatch(setEntireState(generator()))}
      >
        <Star />
        Seed random state
      </IconButton>
    </div>
  )
}
