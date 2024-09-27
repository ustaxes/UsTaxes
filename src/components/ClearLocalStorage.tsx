import { Button, ButtonProps } from '@material-ui/core'
import { PropsWithChildren, ReactElement } from 'react'

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
