import React, { FormEvent, ReactElement, useState } from 'react'
import { Box } from '@material-ui/core'
import { createPDFPopup } from '../pdfFiller/fillPdf'
import { PagerContext } from './pager'
import Alert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2)
    }
  }
}))

export default function CreatePDF (): ReactElement {
  const [errors, updateErrors] = useState<string[]>([])
  const classes = useStyles()

  const onSubmit = async (e: FormEvent<any>): Promise<void> => {
    e.preventDefault()
    return await createPDFPopup().catch((errors: string[]) => updateErrors(errors))
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
            <div className={classes.root}>
              {errors.map((error, i) => <Alert key={i} severity="warning">{error}</Alert>)}
            </div>
          </form>
        </Box>
      }
    </PagerContext.Consumer>
  )
}
