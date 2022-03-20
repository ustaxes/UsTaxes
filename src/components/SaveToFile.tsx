import { Button, ButtonProps } from '@mui/material'
import { PropsWithChildren, ReactElement } from 'react'
import { useDispatch } from 'react-redux'
import { fsPersist } from 'ustaxes/redux/fs/Actions'

const SaveToFile = (props: PropsWithChildren<ButtonProps>): ReactElement => {
  const dispatch = useDispatch()

  const { children, ...rest } = props

  const onClick = () => dispatch(fsPersist())

  return (
    <Button {...rest} onClick={onClick}>
      {children}
    </Button>
  )
}

export default SaveToFile
