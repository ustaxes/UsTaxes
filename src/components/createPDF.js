import React from 'react'
import { Box } from '@material-ui/core'
import { createPDFPopup } from '../pdfFiller/fill1040Fields'

export default function CreatePDF ({ children }) {
  const onSubmit = (e) => {
    e.preventDefault()
    createPDFPopup()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={onSubmit}>
        <Box display="flex" justifyContent="flex-start">
          <h2>Print Copy to File</h2>
        </Box>

        {children}
      </form>
    </Box>
  )
}
