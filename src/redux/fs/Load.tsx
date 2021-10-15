import { Button, ButtonProps } from '@material-ui/core'
import { ChangeEvent, PropsWithChildren, ReactElement } from 'react'
import { loadFile } from '.'

interface LoadProps<S> {
  handleData: (s: S) => void
}

const Load = <S,>(
  props: PropsWithChildren<LoadProps<S> & ButtonProps>
): ReactElement => {
  const { children, handleData, ...rest } = props

  const onClick = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    e.preventDefault()
    const files = e.target.files
    if (files === null || files.length < 1) {
      return
    }
    const file = files[0]

    handleData(await loadFile(file))
  }

  return (
    <Button {...{ ...rest, component: 'label' }}>
      {children}
      <input type="file" hidden accept=".json,text/json" onChange={onClick} />
    </Button>
  )
}

export default Load
