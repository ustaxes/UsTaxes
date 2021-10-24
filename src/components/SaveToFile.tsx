import { Button, ButtonProps } from '@material-ui/core'
import { PropsWithChildren, ReactElement } from 'react'
import { useDispatch, useStore } from 'react-redux'
import { TaxesState } from 'ustaxes/redux/data'
import { FSPersist } from 'ustaxes/redux/fs/Actions'

const SaveToFile = (props: PropsWithChildren<ButtonProps>): ReactElement => {
  const store = useStore<TaxesState>()
  const dispatch = useDispatch()

  const { children, ...rest } = props

  const state = store.getState()

  const onClick = () => dispatch(FSPersist(state))

  return (
    <Button {...rest} onClick={onClick}>
      {children}
    </Button>
  )
}

export default SaveToFile
