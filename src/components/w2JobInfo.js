import React from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'

import { LabeledInput } from './labeledInput'
import { saveW2Data } from '../redux/actions'

export default function W2JobInfo ({ navButtons, onAdvance }) {
  const { register, handleSubmit, errors } = useForm()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData = useSelector(state => state.information.w2Info ?? {})

  // component functions
  const onSubmit = formData => {
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

        <LabeledInput
          label="Occupation"
          register={register}
          required={true}
          name="occupation"
          defaultValue={prevFormData.occupation}
          errors={errors}
        />

        <LabeledInput
          strongLabel="Box 1 - "
          label="Wages, tips, other compensation"
          register={register}
          required={true}
          mask="$999999"
          pattern={/[0-9]*/}
          patternDescription="Input should be filled with numbers only"
          name="income"
          defaultValue={prevFormData.income}
          errors={errors}
        />

        <LabeledInput
          strongLabel="Box 2 - "
          label="Federal income tax withheld"
          register={register}
          required={true}
          mask="$999999"
          pattern={/[0-9]*/}
          patternDescription="Input should be filled with numbers only"
          name="fedWithholding"
          defaultValue={prevFormData.fedWithholding}
          errors={errors}
        />

        { navButtons }
      </form>
    </Box>
  )
}
