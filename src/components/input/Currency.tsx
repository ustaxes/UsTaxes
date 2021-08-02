import React, { ReactElement } from 'react'
import { CurrencyProps } from './types'
import NumberFormat from 'react-number-format'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  positive: {
    color: 'green'
  },
  negative: {
    color: 'red'
  }
}))

export default function Currency(props: CurrencyProps): ReactElement {
  const { prefix = '', value, plain } = props
  const classes = useStyles()

  const className: string | undefined = (() => {
    if (plain !== undefined) {
      return undefined
    }
    if (value > 0) {
      return classes.positive
    } else if (value < 0) {
      return classes.negative
    }
  })()

  return (
    <NumberFormat
      className={className}
      thousandSeparator={true}
      prefix={`${prefix}  $`}
      value={value < 0 ? -value : value}
      displayType="text"
    />
  )
}
