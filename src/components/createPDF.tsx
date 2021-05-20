import React, { FormEvent, ReactElement, useState } from 'react'
import { createPDFPopup } from '../pdfFiller/fillPdf'
import { PagerContext } from './pager'
import Alert from '@material-ui/lab/Alert'
import { makeStyles } from '@material-ui/core/styles'
import log from '../log'

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
    return await createPDFPopup()
      .catch((errors: string[]) => {
        if (errors.length !== undefined && errors.length > 0) {
          updateErrors(errors)
        } else {
          log.error('unhandled exception')
          log.error(errors)
          return Promise.reject(errors)
        }
      })
  }

  return (
    <PagerContext.Consumer>
      { ({ navButtons }) =>
        <form onSubmit={onSubmit}>
          <div>
            <h2>Print Copy to File</h2>
          </div>
          <div className={classes.root}>
            {errors.map((error, i) => <Alert key={i} severity="warning">{error}</Alert>)}
          </div>
          {navButtons}
        </form>
      }
    </PagerContext.Consumer>
  )
}
