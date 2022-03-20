import { ReactElement } from 'react'
import { styled } from '@mui/material/styles'
import { CurrencyProps } from './types'
import NumberFormat from 'react-number-format'
const PREFIX = 'Currency'

const classes = {
  positive: `${PREFIX}-positive`,
  negative: `${PREFIX}-negative`
}

const StyledNumberFormat = styled(NumberFormat)(() => ({
  [`& .${classes.positive}`]: {
    color: 'green'
  },

  [`& .${classes.negative}`]: {
    color: 'red'
  }
}))

export default function Currency(props: CurrencyProps): ReactElement {
  const { prefix = '', value, plain = false } = props

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
    <StyledNumberFormat
      className={className}
      thousandSeparator={true}
      prefix={`${prefix}  $`}
      value={showValue}
      displayType="text"
    />
  )
}
