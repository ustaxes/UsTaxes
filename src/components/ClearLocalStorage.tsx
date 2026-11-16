import type { ButtonProps } from '@material-ui/core'
import { Button } from '@material-ui/core'
import type { PropsWithChildren, ReactElement } from 'react'

const ClearLocalStorage = (
  props: PropsWithChildren<ButtonProps>
): ReactElement => {
  const { children, ...rest } = props

  const onClick = () => {
    localStorage.clear()
    location.reload()
  }

  return (
    <Button {...rest} onClick={onClick}>
      {children}
    </Button>
  )
}

export default ClearLocalStorage
