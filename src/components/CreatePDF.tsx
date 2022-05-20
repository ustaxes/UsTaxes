import { FormEvent, ReactElement, ReactNode, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { usePager } from './pager'
import Alert from '@material-ui/lab/Alert'
import { useSelector } from 'react-redux'
import { Information, Asset, State, TaxYear } from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'

import yearFormBuilder from 'ustaxes/forms/YearForms'
import { intentionallyFloat, run, runAsync } from 'ustaxes/core/util'
import { Box, Button } from '@material-ui/core'
import Summary from './Summary'

import { savePDF } from 'ustaxes/pdfHandler'
import StateForm from 'ustaxes/core/stateForms/Form'
import Form from 'ustaxes/core/irsForms/Form'

export default function CreatePDF(): ReactElement {
  const [irsErrors, updateIrsErrors] = useState<string[]>([])
  const [stateErrors, updateStateErrors] = useState<string[]>([])
  const [irsForms, updateIrsForms] = useState<Form[]>([])
  const [stateForms, updateStateForms] = useState<StateForm[]>([])

  const year: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )
  const info: Information = useSelector(
    (state: YearsTaxesState) => state[state.activeYear]
  )

  const assets: Asset<Date>[] = useSelector(
    (state: YearsTaxesState) => state.assets
  )

  useEffect(() => {
    const builder = yearFormBuilder(year, info, assets)
    const f1040Errors = builder.errors()

    updateIrsErrors(f1040Errors)
    if (f1040Errors.length > 0) {
      updateStateErrors(['Cannot build state return with IRS errors'])
      updateStateForms([])
      updateIrsForms([])
    } else {
      const irsRes = builder.f1040()
      const stateRes = builder.makeStateReturn()

      run(stateRes).fold(updateStateErrors, (stateForms) => {
        updateStateErrors([])
        updateStateForms(stateForms)
      })

      run(irsRes).fold(updateIrsErrors, (f1040Forms) => {
        updateIrsErrors([])
        updateIrsForms(f1040Forms)
      })
    }
  }, [info])

  const lastName = info.taxPayer.primaryPerson?.lastName
  const residency: State | undefined = info.stateResidencies[0]?.state

  const federalFileName = `${lastName ?? 'Tax'}-1040.pdf`
  const stateFileName = `${lastName ?? 'StateTax'}-${residency}.pdf`

  const { navButtons } = usePager()

  const federalReturn = async (e: FormEvent<Element>): Promise<void> => {
    e.preventDefault()
    const builder = yearFormBuilder(year, info, assets)

    const r1 = await runAsync(builder.f1040Bytes())
    const r2 = await r1.mapAsync((bytes) => savePDF(bytes, federalFileName))
    return r2.orThrow()
  }

  const stateReturn = async (): Promise<void> => {
    const builder = yearFormBuilder(year, info, assets)

    const r1 = await runAsync(builder.stateReturnBytes())
    const r2 = await r1.mapAsync((bytes) => savePDF(bytes, stateFileName))
    return r2.orThrow()
  }

  const printActions: ReactNode = (() => {
    if (irsErrors.length === 0) {
      return (
        <>
          <h2>Print Copy to File</h2>
          <h3>Federal</h3>
          <Box marginBottom={2}>
            <Button
              type="button"
              onClick={intentionallyFloat(federalReturn)}
              variant="contained"
              color="primary"
            >
              Create Federal 1040
            </Button>
          </Box>
          {(() => {
            if (info.stateResidencies.length > 0) {
              return <h3>State: {info.stateResidencies[0].state} </h3>
            }
          })()}
          <Box marginBottom={2}>
            {(() => {
              if (stateErrors.length === 0) {
                return (
                  <Button
                    type="button"
                    onClick={intentionallyFloat(stateReturn)}
                    variant="contained"
                    color="primary"
                  >
                    Create {residency} Return
                  </Button>
                )
              }
              return stateErrors.map((e) => (
                <Alert key={e} severity="info">
                  {e}
                </Alert>
              ))
            })()}
          </Box>
        </>
      )
    }
  })()

  return (
    <div>
      <Summary
        errors={irsErrors}
        stateErrors={stateErrors}
        irsForms={irsForms}
        stateForms={stateForms}
      />
      <form tabIndex={-1}>
        <Helmet>
          <title>Print Copy to File | Results | UsTaxes.org</title>
        </Helmet>
        {printActions}
        {navButtons}
      </form>
    </div>
  )
}
