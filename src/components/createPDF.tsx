import React, { FormEvent, ReactElement } from 'react'
import { Box } from '@material-ui/core'
import { createPDFPopup } from '../pdfFiller/fill1040Fields'
import { DonePagedFormProps } from './pager'

export default function CreatePDF ({ navButtons }: DonePagedFormProps): ReactElement {
  const onSubmit = (e: FormEvent<any>): void => {
    e.preventDefault()
    // This function must not return anything, because that's what
    // form's parameter expects. But createPDFPopup is an async
    // function. So here we are explicitly ignoring the results of
    // that future.
    createPDFPopup().then(() => {}, () => {})
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={onSubmit}>
        <Box display="flex" justifyContent="flex-start">
          <h2>Print Copy to File</h2>
        </Box>

        {navButtons}
      </form>
    </Box>
  )
}
