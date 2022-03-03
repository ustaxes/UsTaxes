import { Button, ButtonProps } from '@material-ui/core'
import { ChangeEvent, PropsWithChildren, ReactElement } from 'react'
import { loadFile } from '.'

interface LoadProps<S> {
  handleData: (s: S) => void
}

interface Accept {
  accept?: string
}

export const LoadRaw = (
  props: PropsWithChildren<LoadProps<string> & Accept & ButtonProps>
): ReactElement => {
  const { children, handleData, accept = '.*,text', ...rest } = props

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
      <input type="file" hidden accept={accept} onChange={onClick} />
    </Button>
  )
}

const Load = <S,>(
  props: PropsWithChildren<LoadProps<S> & ButtonProps>
): ReactElement => {
  const { children, handleData, ...rest } = props

  return (
    <LoadRaw
      {...rest}
      handleData={(contents: string) => handleData(JSON.parse(contents) as S)}
    >
      {children}
    </LoadRaw>
  )
}

export default Load
