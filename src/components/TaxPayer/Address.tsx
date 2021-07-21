import React, { ReactElement } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { field, Fields } from '../Fields'
import { Patterns } from '../Patterns'

interface AddressProps {
  checkboxText: string
  allowForeignCountry?: boolean
}

const domesticFields = [
  field('State', 'address.state', undefined, 'state'),
  field('Zip', 'address.zip', Patterns.zip)
]

const foreignFields = [
  field('Province', 'address.province', Patterns.name),
  field('Postal Code', 'address.postalCode'),
  field('Country', 'address.foreignCountry', undefined, 'country')
]

const mainFields = [
  field('Address', 'address.address', undefined, 'text', true),
  field('Unit No', 'address.aptNo', undefined, 'text', false),
  field('City', 'address.city', Patterns.name)
]

export default function AddressFields (props: AddressProps): ReactElement {
  const {
    checkboxText = 'Check if you have a foreign address',
    allowForeignCountry = true
  } = props

  const { control } = useFormContext<{isForeignCountry: boolean }>()

  const isForeignCountry = useWatch({
    name: 'isForeignCountry',
    control
  })

  const foreignCountryField = field(checkboxText, 'isForeignCountry', undefined, 'checkbox')

  return (
    <Fields fields={[
      ...mainFields,
      ...(allowForeignCountry ? [foreignCountryField] : []),
      ...(!allowForeignCountry || !isForeignCountry ? domesticFields : foreignFields)
    ]} />
  )
}
