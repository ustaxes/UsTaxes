import { Button, ButtonProps } from '@material-ui/core'
import { PropsWithChildren, ReactElement } from 'react'
import { useDispatch } from 'react-redux'

const ClearLocalStorage = (
  props: PropsWithChildren<ButtonProps>
): ReactElement => {
  const { children, ...rest } = props

  const onClick = () => localStorage.clear()

  return (
    <Button {...rest} onClick={onClick}>
      {children}
    </Button>
  )
}

export default ClearLocalStorage
