import { Button, ButtonProps } from '@material-ui/core'
import { ChangeEvent, PropsWithChildren, ReactElement } from 'react'
import { loadFile, loadFileBinary } from '.'

interface LoadFileProps<S> {
  load: (file: File) => Promise<S>
}
interface LoadProps<S> {
  handleData: (s: S) => void
}

interface Accept {
  accept?: string
}

export const LoadF = <S,>(
  props: PropsWithChildren<
    LoadProps<S> & LoadFileProps<S> & Accept & ButtonProps
  >
): ReactElement => {
  const { children, load, handleData, accept = '.*,text', ...rest } = props

  const onClick = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    e.preventDefault()
    const files = e.target.files
    if (files === null || files.length < 1) {
      return
    }
    const file = files[0]

    handleData(await load(file))
  }

  return (
    <Button {...{ ...rest, component: 'label' }}>
      {children}
      <input type="file" hidden accept={accept} onChange={onClick} />
    </Button>
  )
}

export const LoadRaw = (
  props: PropsWithChildren<LoadProps<string> & Accept & ButtonProps>
): ReactElement => <LoadF<string> {...props} load={loadFile} />

export const Load = <S,>(
  props: PropsWithChildren<LoadProps<S> & Accept & ButtonProps>
): ReactElement => {
  const { handleData, ...rest } = props

  return (
    <LoadRaw
      {...rest}
      handleData={(contents: string) => handleData(JSON.parse(contents) as S)}
    />
  )
}

export const LoadBinary = (
  props: PropsWithChildren<LoadProps<ArrayBuffer> & Accept & ButtonProps>
): ReactElement => <LoadF<ArrayBuffer> load={loadFileBinary} {...props} />

export default Load
