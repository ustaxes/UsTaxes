/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, ButtonProps } from '@material-ui/core'
import { ChangeEvent, PropsWithChildren, ReactElement } from 'react'

const load = async <S,>(file: File): Promise<S> => {
  const fileReader: FileReader = new FileReader()

  return new Promise((resolve, reject) => {
    fileReader.onload = function (
      this: FileReader,
      e: ProgressEvent<FileReader>
    ): any {
      e.preventDefault()
      const contents: string = fileReader.result as string
      if (contents === null) {
        reject('file contents were null')
      }
      const state: S = JSON.parse(contents)
      resolve(state)
    }
    fileReader.readAsText(file)
  })
}

interface LoadProps<S> {
  handleData: (s: S) => void
}

const Load = <S,>(
  props: PropsWithChildren<LoadProps<S> & ButtonProps>
): ReactElement => {
  const { children, handleData, ...rest } = props

  const onClick = async (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (files === null || files.length < 1) {
      return
    }
    const file = files[0]

    if (file) {
      handleData(await load(file))
    }
  }

  return (
    <Button {...{ ...rest, component: 'label' }}>
      {children}
      <input type="file" hidden accept=".json,text/json" onChange={onClick} />
    </Button>
  )
}

export default Load
