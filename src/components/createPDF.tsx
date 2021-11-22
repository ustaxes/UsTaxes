import { FormEvent, ReactElement, useState } from 'react'
import { usePager } from './pager'
import Alert from '@material-ui/lab/Alert'
import log from 'ustaxes/log'
import { useSelector } from 'react-redux'
import { Information, State } from 'ustaxes/forms/Y2020/data'
import { YearsTaxesState, TaxYear, TaxYears } from 'ustaxes/redux'

import {
  createStatePDF,
  createStateReturn,
  stateForm
} from 'ustaxes/forms/Y2020/stateForms'
import { create1040 } from 'ustaxes/forms/Y2020/irsForms/Main'
import { isRight } from 'ustaxes/forms/Y2020/util'
import { PDFDownloader } from 'ustaxes/forms/Y2020/pdfFiller/pdfHandler'
import { Box, Button } from '@material-ui/core'
import Summary from './Summary'
import { create1040PDF } from 'ustaxes/forms/Y2020/irsForms'
import { store } from 'ustaxes/redux/store'
import { savePDF } from 'ustaxes/pdfHandler'
import TaxesStateMethods from 'ustaxes/redux/TaxesState'

interface CreatePDFProps {
  downloader: PDFDownloader
}

export const canCreateFederalReturn = (year: TaxYear): boolean =>
  year === 'Y2020'

// opens new with filled information in the window of the component it is called from
export const createPDFPopup =
  (defaultFilename: string) =>
  async (downloader: PDFDownloader): Promise<void> => {
    const information = new TaxesStateMethods(store.getState()).info()
    if (information === undefined) {
      throw new Error(
        `Information was undefined for tax year: ${store.getState().activeYear}`
      )
    }
    const pdfBytes = await create1040PDF(information)(downloader)
    return await savePDF(pdfBytes, defaultFilename)
  }

export default function CreatePDF({
  downloader
}: CreatePDFProps): ReactElement {
  const [errors, updateErrors] = useState<string[]>([])

  const year: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )
  const info: Information | undefined = useSelector(
    (state: YearsTaxesState) => state[state.activeYear]
  )
  const lastName = info?.taxPayer.primaryPerson?.lastName
  const residency: State | undefined = info?.stateResidencies[0]?.state

  const federalFileName = `${lastName}-1040.pdf`
  const stateFileName = `${lastName}-${residency}.pdf`

  const { navButtons } = usePager()

  const federalReturn = async (e: FormEvent<Element>): Promise<void> => {
    e.preventDefault()
    return await createPDFPopup(federalFileName)(downloader).catch(
      (errors: string[]) => {
        if (errors.length !== undefined && errors.length > 0) {
          updateErrors(errors)
        } else {
          log.error('unhandled exception')
          log.error(errors)
          return Promise.reject(errors)
        }
      }
    )
  }

  const stateReturn = async (): Promise<void> => {
    if (info !== undefined) {
      const f1040Result = create1040(info)
      if (isRight(f1040Result)) {
        const stateReturn = await createStateReturn(info, f1040Result.right[0])
        if (stateReturn !== undefined) {
          const pdfBytes = (
            await createStatePDF(stateReturn)(downloader)
          ).save()
          savePDF(await pdfBytes, stateFileName)
        }
      }
    }
  }

  const canCreateFederal = canCreateFederalReturn(year)
  const canCreateState =
    canCreateFederal &&
    residency !== undefined &&
    stateForm[residency] !== undefined

  return (
    <div>
      <Summary />
      <form tabIndex={-1}>
        <h2>Print Copy to File</h2>
        <div>
          {errors.map((error, i) => (
            <Alert key={i} severity="warning">
              {error}
            </Alert>
          ))}
        </div>
        {(() => {
          if (canCreateFederal) {
            return (
              <Box
                display="flex"
                justifyContent="flex-start"
                paddingTop={2}
                paddingBottom={1}
              >
                <Button
                  type="button"
                  onClick={federalReturn}
                  variant="contained"
                  color="primary"
                >
                  Create Federal 1040
                </Button>
              </Box>
            )
          }
          return (
            <Alert severity="info">
              Support for federal return for {TaxYears[year]} is not yet
              available.
            </Alert>
          )
        })()}
        {(() => {
          if (canCreateState) {
            return (
              <Box
                display="flex"
                justifyContent="flex-start"
                paddingTop={2}
                paddingBottom={1}
              >
                <Button
                  type="button"
                  onClick={stateReturn}
                  variant="contained"
                  color="primary"
                >
                  Create {residency} Return
                </Button>
              </Box>
            )
          }
          return (
            <Alert severity="info">
              Support for {residency ?? 'state'} return for {TaxYears[year]} not
              yet available.
            </Alert>
          )
        })()}
        {navButtons}
      </form>
    </div>
  )
}
