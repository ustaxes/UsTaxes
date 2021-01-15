import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Box } from '@material-ui/core'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { LabeledInput, LabeledCheckBox } from './labeledInput'
import { saveFamilyInfo } from '../redux/actions'

export default function FamilyInfo () {
  const { register, handleSubmit, errors, control } = useForm()
  const history = useHistory()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData = useSelector(state => {
    return state.information.familyInfo ?? {}
  })
  const [foreignAddress, setforeignAddress] = useState(prevFormData.foreignAddress === 'true')

  // component functions
  const onSubmit = formData => {
    console.log('formData: ', formData)
    dispatch(saveFamilyInfo(formData))
    history.push('/createPDF')
  }

  return (
    <Box display="flex" justifyContent="center">
      <form onSubmit={handleSubmit(onSubmit)}>

        <Box display="flex" justifyContent="flex-start">
          <h2>Family Information</h2>
        </Box>

        <LabeledCheckBox
          foreignAddress={foreignAddress}
          setforeignAddress={setforeignAddress}
          control={control}
          description="Do you have a foreign address?"
        />

        <LabeledInput
          label="Bank Routing number"
          register={register}
          required={true}
          mask="999999999"
          pattern={/[0-9]{9}/}
          patternDescription="Input should be filled with 10 numbers"
          name="routingNumber"
          defaultValue={prevFormData.routingNumber}
          errors={errors}
        />

        <LabeledInput
          label="Bank Account number"
          register={register}
          required={true}
          mask="999999999999"
          pattern={/[0-9]{10}|[0-9]{11}|[0-9]{12}/}
          patternDescription="Input should be filled with 10-12 numbers"
          name="accountNumber"
          defaultValue={prevFormData.accountNumber}
          errors={errors}
        />

        <LabeledInput
          label="Contact phone number"
          register={register}
          required={true}
          mask="999-999-9999"
          pattern={/[0-9]{3}-[0-9]{3}-[0-9]{4}/}
          patternDescription="Input should be filled with 10 numbers"
          name="contactPhoneNumber"
          defaultValue={prevFormData.contactPhoneNumber}
          errors={errors}
        />

        <LabeledInput
          label="Contact email address"
          register={register}
          required={true}
          name="contactEmail"
          defaultValue={prevFormData.contactEmail}
          errors={errors}
        />

        <Box display="flex" justifyContent="flex-start" paddingTop={2} paddingBottom={1}>
          <Box display="flex" justifyContent="flex-start" paddingRight={2}>
            <Button component={Link} to="w2jobinfo" variant="contained" color="secondary" >
              Back
            </Button>
          </Box>

          <Button type="submit" variant="contained" color="primary">
            Save and Continue
          </Button>
        </Box>
      </form>
    </Box>
  )
}
