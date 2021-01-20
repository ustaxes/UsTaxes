import React, { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledInput, Patterns } from './labeledInput'
import { saveW2Data } from '../redux/actions'
import { PagedFormProps } from './pager'
import { TaxesState, W2Info } from '../redux/data'

export default function W2JobInfo ({ navButtons, onAdvance }: PagedFormProps): ReactElement {
  const { register, handleSubmit, errors } = useForm()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData: W2Info | undefined = useSelector((state: TaxesState) => state.information.w2Info)

  // component functions
  const onSubmit = (formData: W2Info): void => {
    console.log('formData: ', formData)
    dispatch(saveW2Data(formData))
    onAdvance()
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Job Information</h2>
        </Box>
        <Box display="flex" justifyContent="flex-start">
          <strong>Input data from W-2</strong>
        </Box>
        <LabeledInput
          label="Occupation"
          register={register}
          required={true}
          name="occupation"
          defaultValue={prevFormData?.occupation ?? ''}
          errors={errors}
        />

        <LabeledInput
          strongLabel="Box 1 - "
          label="Wages, tips, other compensation"
          register={register}
          required={true}
          patternConfig={Patterns.currency}
          name="income"
          defaultValue={prevFormData?.income ?? ''}
          errors={errors}
        />

        <LabeledInput
          strongLabel="Box 2 - "
          label="Federal income tax withheld"
          register={register}
          required={true}
          name="fedWithholding"
          patternConfig={Patterns.currency}
          defaultValue={prevFormData?.fedWithholding ?? ''}
          errors={errors}
        />
        { navButtons }
      </form>
    </Box>
  )
}
