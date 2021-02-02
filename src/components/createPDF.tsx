import React, { FormEvent, ReactElement } from 'react'
import { Box } from '@material-ui/core'
import { createPDFPopup } from '../pdfFiller/fill1040Fields'
import { DonePagedFormProps } from './pager'

export default function CreatePDF ({ navButtons }: DonePagedFormProps): ReactElement {
  const onSubmit = async (e: FormEvent<any>): Promise<void> => {
    e.preventDefault()
    return await createPDFPopup()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={onSubmit}>
        <div>
          <Box display="flex" justifyContent="flex-start">
            <h2>Print Copy to File</h2>
          </Box>

          {navButtons}
        </div>
      </form>
    </Box>
  )
}
