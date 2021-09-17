import { Button } from '@material-ui/core'
import { ReactElement } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch } from 'ustaxes/redux'
import { useSelector } from 'react-redux'
import { setActiveYear } from 'ustaxes/redux/actions'
import { TaxesState, TaxYear, TaxYears } from 'ustaxes/redux/data'
import { enumKeys } from 'ustaxes/util'
import { GenericLabeledDropdown } from './input'

interface YearForm {
  year: TaxYear
}

const YearDropDown = (): ReactElement => {
  const year = useSelector((state: TaxesState) => state.activeYear)
  const methods = useForm<YearForm>({
    defaultValues: { year }
  })

  const { handleSubmit } = methods

  const dispatch = useDispatch()

  const onSubmit = ({ year }: YearForm) => dispatch(setActiveYear(year))

  return (
    <FormProvider {...methods}>
      <GenericLabeledDropdown<TaxYear>
        dropDownData={enumKeys(TaxYears)}
        name="year"
        label="Select TaxYear"
        valueMapping={(x) => x}
        keyMapping={(x) => x}
        textMapping={(x) => x}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => handleSubmit(onSubmit)()}
      >
        Update
      </Button>
    </FormProvider>
  )
}

export default YearDropDown
