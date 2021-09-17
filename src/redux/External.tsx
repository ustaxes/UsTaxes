/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, ButtonProps } from '@material-ui/core'
import { ChangeEvent, PropsWithChildren, ReactElement } from 'react'
import { useDispatch, useStore } from 'react-redux'
import { Information, TaxesState } from './data'
import { setEntireState } from './actions'

const download = (filename: string, text: string): void => {
  const element = document.createElement('a')
  element.setAttribute(
    'href',
    'data:text/json;charset=utf-8,' + encodeURIComponent(text)
  )
  element.setAttribute('download', filename)

  element.style.display = 'none'
  document.body.appendChild(element)

  element.click()

  document.body.removeChild(element)
}

const Load = (props: PropsWithChildren<ButtonProps>): ReactElement => {
  const { children, ...rest } = props
  const dispatch = useDispatch()

  const onClick = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const files = e.target.files
    if (files === null || files.length < 1) {
      return
    }
    const fileReader: FileReader = new FileReader()
    const file = files[0]

    if (file) {
      fileReader.onload = function (
        this: FileReader,
        e: ProgressEvent<FileReader>
      ): any {
        e.preventDefault()
        const contents: string = fileReader.result as string
        if (contents === null) {
          return
        }
        const information: Information = JSON.parse(contents)
        dispatch(setEntireState({ information }))
      }
      fileReader.readAsText(file)
    }
  }

  return (
    <Button {...{ ...rest, component: 'label' }}>
      {children}
      <input type="file" hidden accept=".json,text/json" onChange={onClick} />
    </Button>
  )
}

const Exfiltrate = (props: PropsWithChildren<ButtonProps>): ReactElement => {
  const store = useStore<TaxesState>()

  const { children, ...rest } = props

  const info = store.getState().information

  const onClick = () =>
    download(
      `${info.taxPayer.primaryPerson?.lastName ?? 'return_data'}.json`,
      JSON.stringify(info)
    )

  return (
    <Button {...rest} onClick={onClick}>
      {children}
    </Button>
  )
}

export { Exfiltrate, Load }
