import React, { FormEvent, ReactElement } from 'react'
import { Box } from '@material-ui/core'
import { createPDFPopup } from '../pdfFiller/fillPdf'
import { PagerContext } from './pager'

export default function CreatePDF (): ReactElement {
  const onSubmit = async (e: FormEvent<any>): Promise<void> => {
    e.preventDefault()
    return await createPDFPopup()
  }

  return (
    <PagerContext.Consumer>
      { ({ navButtons }) =>
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
      }
    </PagerContext.Consumer>
  )
}
