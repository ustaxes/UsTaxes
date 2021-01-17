import React, { FormEvent, ReactElement } from 'react'
import { Box } from '@material-ui/core'
import { createPDFPopup } from '../pdfFiller/fill1040Fields'
import { FinishAll } from './paging'

export default function CreatePDF (): ReactElement {
  async function onSubmit (e: FormEvent<any>): Promise<void> {
    e.preventDefault()
    return await createPDFPopup()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={onSubmit}>
        <Box display="flex" justifyContent="flex-start">
          <h2>Print Copy to File</h2>
        </Box>
        <FinishAll />
      </form>
    </Box>
  )
}
