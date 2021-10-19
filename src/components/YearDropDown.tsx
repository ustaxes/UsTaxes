import { Button, Grid } from '@material-ui/core'
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

interface YearDropProps {
  onDone?: () => void
}

const YearDropDown = (props: YearDropProps): ReactElement => {
  const {
    onDone = () => {
      // default do nothing
    }
  } = props
  const year = useSelector((state: TaxesState) => state.activeYear)
  const methods = useForm<YearForm>({
    defaultValues: { year }
  })

  const { handleSubmit, watch } = methods

  const selected = watch('year')
  const dirty = selected !== year

  const dispatch = useDispatch()

  const onSubmit = ({ year }: YearForm) => {
    dispatch(setActiveYear(year))
    onDone()
  }

  return (
    <FormProvider {...methods}>
      <Grid container spacing={1} alignItems="center">
        <GenericLabeledDropdown<TaxYear>
          dropDownData={enumKeys(TaxYears)}
          name="year"
          label="Select Tax Year"
          valueMapping={(x) => x}
          keyMapping={(x) => x}
          textMapping={(x) => TaxYears[x]}
          sizes={{ xs: 9 }}
        />
        <Grid item>
          <Button
            variant="contained"
            color={dirty ? 'primary' : 'secondary'}
            onClick={() => handleSubmit(onSubmit)()}
          >
            Update
          </Button>
        </Grid>
      </Grid>
    </FormProvider>
  )
}

export default YearDropDown
