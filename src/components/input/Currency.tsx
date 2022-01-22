import { ReactElement } from 'react'
import { CurrencyProps } from './types'
import NumberFormat from 'react-number-format'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(() => ({
  positive: {
    color: 'green'
  },
  negative: {
    color: 'red'
  }
}))

export default function Currency(props: CurrencyProps): ReactElement {
  const { prefix = '', value, plain = false } = props
  const classes = useStyles()

  const className: string | undefined = (() => {
    if (plain) {
      return undefined
    }
    if (value > 0) {
      return classes.positive
    } else if (value < 0) {
      return classes.negative
    }
  })()

  const showValue = (() => {
    if (value === Math.trunc(value)) {
      return Math.abs(value)
    }
    return Math.abs(value).toFixed(2)
  })()

  return (
    <NumberFormat
      className={className}
      thousandSeparator={true}
      prefix={`${prefix}  $`}
      value={showValue}
      displayType="text"
    />
  )
}
