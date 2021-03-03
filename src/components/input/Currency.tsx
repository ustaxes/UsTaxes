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

export default function Currency (props: CurrencyProps): ReactElement {
  const { prefix = '', value } = props
  const classes = useStyles()

  const className: string | undefined = (() => {
    if (value > 0) {
      return classes.positive
    } else if (value < 0) {
      return classes.negative
    }
  })()

  return (
    <NumberFormat
      className={className}
      thousandSeparator={ true }
      prefix={ `${prefix}  $` }
      value={ value }
      displayType="text"
    />
  )
}
