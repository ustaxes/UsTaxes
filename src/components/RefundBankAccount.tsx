import React, { ReactElement, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Box } from '@material-ui/core'
import { useDispatch, useSelector } from 'react-redux'
import { LabeledCheckBox, LabeledInput } from './input'
import { Patterns } from './Patterns'
import { saveRefundInfo } from '../redux/actions'

import { AccountType, Refund, TaxesState } from '../redux/data'
import { PagerContext } from './pager'

interface UserRefundForm {
  routingNumber: string
  accountNumber: string
  isChecking: boolean
  isSavings: boolean
}

const toRefund = (formData: UserRefundForm): Refund => ({
  routingNumber: formData.routingNumber,
  accountNumber: formData.accountNumber,
  accountType: formData.isChecking ? AccountType.checking : AccountType.savings
})

export default function RefundBankAccount (): ReactElement {
  const { register, handleSubmit, errors, control } = useForm<UserRefundForm>()
  // const variable dispatch to allow use inside function
  const dispatch = useDispatch()

  const prevFormData: Refund | undefined = useSelector((state: TaxesState) => {
    return state.information.refund
  })

  const [isChecking, updateChecking] = useState(prevFormData?.accountType === AccountType.checking)

  // component functions
  const onSubmit = (onAdvance: () => void) => (formData: UserRefundForm): void => {
    dispatch(saveRefundInfo(toRefund(formData)))
    onAdvance()
  }

  return (
    <PagerContext.Consumer>
      { ({ onAdvance, navButtons }) =>
        <Box display="flex" justifyContent="center">
          <form onSubmit={handleSubmit(onSubmit(onAdvance))}>
            <div>
              <Box display="flex" justifyContent="flex-start">
                <h2>Refund Information</h2>
              </Box>

              <LabeledInput
                label="Bank Routing number"
                register={register}
                required={true}
                patternConfig={Patterns.bankRouting}
                name="routingNumber"
                defaultValue={prevFormData?.routingNumber}
                error={errors.routingNumber}
              />

              <LabeledInput
                label="Bank Account number"
                register={register}
                required={true}
                patternConfig={Patterns.bankAccount}
                name="accountNumber"
                defaultValue={prevFormData?.accountNumber}
                error={errors.accountNumber}
              />
              <Box display="flex" justifyContent="flex-start">
                <h4>Type</h4>
              </Box>
              <LabeledCheckBox
                control={control}
                name="isChecking"
                value={isChecking}
                setValue={updateChecking}
                label="Checking"
              />
              <LabeledCheckBox
                name="isSavings"
                control={control}
                value={!isChecking}
                setValue={(v) => updateChecking(!v)}
                label="Savings"
              />

              {navButtons}
            </div>
          </form>
        </Box>
      }
    </PagerContext.Consumer>
  )
}
