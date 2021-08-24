import React, { ReactElement } from 'react'
import { IconButton, makeStyles, Theme } from '@material-ui/core'
import { Star } from '@material-ui/icons'
import fc from 'fast-check'
import { useDispatch } from 'react-redux'
import { setEntireState } from 'ustaxes/redux/actions'
import { TaxesState } from 'ustaxes/redux/data'
import { taxesState } from 'ustaxes/tests/arbitraries'
import * as prand from 'pure-rand'

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: 'absolute',
    top: '0px',
    right: '30px',
    width: '30px',
    height: '30px'
  }
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
    <IconButton
      className={classes.root}
      onClick={() => dispatch(setEntireState(generator()))}
    >
      <Star />
      Seed random state
    </IconButton>
  )
}
