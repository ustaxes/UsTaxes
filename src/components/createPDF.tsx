import { FormEvent, ReactElement, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { usePager } from './pager'
import Alert from '@material-ui/lab/Alert'
import { useSelector } from 'react-redux'
import { Information, State } from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'
import { TaxYear, TaxYears } from 'ustaxes/data'

import yearFormBuilder from 'ustaxes/forms/YearForms'
import { isLeft, runAsync } from 'ustaxes/core/util'
import { Box, Button } from '@material-ui/core'
import Summary from './Summary'

import { store } from 'ustaxes/redux/store'
import { savePDF } from 'ustaxes/pdfHandler'

export default function CreatePDF(): ReactElement {
  const [irsErrors, updateIrsErrors] = useState<string[]>([])
  const [stateErrors, updateStateErrors] = useState<string[]>([])

  const year: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )
  const info: Information | undefined = useSelector(
    (state: YearsTaxesState) => state[state.activeYear]
  )

  const builder = info === undefined ? undefined : yearFormBuilder(year, info)

  useEffect(() => {
    if (builder !== undefined) {
      const f1040Res = builder.f1040()
      if (isLeft(f1040Res)) {
        updateIrsErrors(f1040Res.left)
        updateStateErrors(['Cannot build state return with IRS errors'])
      } else {
        updateIrsErrors([])
        const stateRes = builder.makeStateReturn()
        if (isLeft(stateRes)) {
          updateStateErrors(stateRes.left)
        } else {
          updateStateErrors([])
        }
      }
    } else {
      updateIrsErrors([
        `Information was undefined for tax year: ${store.getState().activeYear}`
      ])
      updateStateErrors([
        `Information was undefined for tax year: ${store.getState().activeYear}`
      ])
    }
  }, [info])

  const lastName = info?.taxPayer.primaryPerson?.lastName
  const residency: State | undefined = info?.stateResidencies[0]?.state

  const federalFileName = `${lastName}-1040.pdf`
  const stateFileName = `${lastName}-${residency}.pdf`

  const { navButtons } = usePager()

  const federalReturn = async (e: FormEvent<Element>): Promise<void> => {
    e.preventDefault()
    if (builder !== undefined) {
      const r1 = await runAsync(builder.f1040Bytes())
      const r2 = await r1.mapAsync((bytes) => savePDF(bytes, federalFileName))
      return r2.orThrow()
    }
  }

  const stateReturn = async (): Promise<void> => {
    if (builder !== undefined) {
      const r1 = await runAsync(builder.stateReturnBytes())
      const r2 = await r1.mapAsync((bytes) => savePDF(bytes, stateFileName))
      return r2.orThrow()
    }
  }

  const canCreateFederal =
    irsErrors.length === 0 && (builder?.canCreateFederal() ?? false)

  const canCreateState =
    canCreateFederal &&
    stateErrors.length === 0 &&
    residency !== undefined &&
    info !== undefined &&
    (builder?.canCreateState() ?? false)

  return (
    <div>
      <Summary />
      <form tabIndex={-1}>
        <Helmet>
          <title>Print Copy to File | Results | UsTaxes.org</title>
        </Helmet>
        <h2>Print Copy to File</h2>
        <div>
          {[...irsErrors, ...stateErrors].map((error, i) => (
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
