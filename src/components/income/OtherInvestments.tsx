import { ReactElement, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, YearsTaxesState } from 'ustaxes/redux'
import { useSelector } from 'react-redux'
import { addAsset } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import { Asset, AssetType, State, TaxYears } from 'ustaxes/core/data'
import {
  GenericLabeledDropdown,
  USStateDropDown,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { OpenableFormContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { TransactionImporter } from './assets/TransactionImporter'
import FilteredAssetsTable from './assets/FilteredAssetsTable'
import { DatePicker } from '../input/DatePicker'

const showAssetType = (p: AssetType) => {
  switch (p) {
    case 'Security':
      return 'Security (Stock, bond, option, mutual fund, etc.)'
    case 'Real Estate':
      return 'Real Estate'
  }
}

interface AssetUserInput {
  name: string
  positionType: AssetType
  openDate?: Date
  closeDate?: Date
  openPrice: string
  closePrice?: string
  quantity: string
  state?: State
}

const toAsset = (input: AssetUserInput): Asset<Date> | undefined => {
  const {
    name,
    openDate,
    closeDate,
    openPrice,
    closePrice,
    quantity,
    state,
    positionType
  } = input
  if (name === '' || openDate === undefined) {
    return undefined
  }
  return {
    positionType,
    name,
    openDate,
    closeDate,
    openPrice: Number(openPrice),
    closePrice: Number(closePrice),
    quantity: input.positionType === 'Real Estate' ? 1 : Number(quantity),
    state
  }
}

export const OtherInvestments = (): ReactElement => {
  const year = useSelector((state: YearsTaxesState) => state.activeYear)
  const [isOpen, setOpen] = useState(false)
  const methods = useForm<AssetUserInput>()
  const { handleSubmit, watch } = methods
  const positionType = watch('positionType')
  const closeDate = watch('closeDate')
  const dispatch = useDispatch()

  const { onAdvance, navButtons } = usePager()

  const onSubmitAdd = (formData: AssetUserInput): void => {
    const payload = toAsset(formData)
    if (payload !== undefined) {
      dispatch(addAsset(payload))
    }
  }

  const form: ReactElement | undefined = (
    <OpenableFormContainer
      isOpen={isOpen}
      onOpenStateChange={setOpen}
      onSave={onSubmitAdd}
    >
      <Grid container spacing={2}>
        <h3>Add Assets</h3>
        <GenericLabeledDropdown<AssetType>
          label="Asset Type"
          name="positionType"
          dropDownData={['Security', 'Real Estate']}
          keyMapping={(x) => x}
          textMapping={showAssetType}
          valueMapping={(x) => x}
        />
        <LabeledInput
          label={positionType === 'Real Estate' ? 'Address' : 'Name'}
          name="name"
        />
        <DatePicker
          maxDate={new Date(2021, 12, 31)}
          label="Date acquired"
          name="openDate"
        />
        <DatePicker
          maxDate={new Date(2021, 12, 31)}
          label="Date sold or disposed of"
          name="closeDate"
        />
        {(() => {
          if (positionType === 'Real Estate') {
            return (
              <>
                <LabeledInput
                  label="Cost basis"
                  patternConfig={Patterns.currency}
                  name="openPrice"
                />
                <LabeledInput
                  label="Proceeds (sales price)"
                  patternConfig={Patterns.currency}
                  name="closePrice"
                />
                <USStateDropDown label="Property state" name="state" />
              </>
            )
          } else {
            return (
              <>
                <LabeledInput
                  label="Cost basis per unit"
                  patternConfig={Patterns.currency}
                  name="openPrice"
                />
                <LabeledInput
                  label="Quantity"
                  patternConfig={Patterns.number}
                  name="quantity"
                />
                <LabeledInput
                  label="Proceeds (sales price)"
                  patternConfig={Patterns.currency}
                  name="closePrice"
                />
              </>
            )
          }
        })()}
        {(() => {
          if (
            closeDate !== undefined &&
            closeDate.getFullYear() !== TaxYears[year]
          ) {
            return (
              <Alert severity="warning">
                This asset will not be included in the current year&apos;s
                return because you have not selected a date in the current year.
              </Alert>
            )
          }
        })()}
      </Grid>
    </OpenableFormContainer>
  )

  return (
    <>
      <Helmet>
        <title>Other Investments | Income | UsTaxes.org</title>
      </Helmet>
      <h2>Other Investments</h2>
      <FilteredAssetsTable />
      <FormProvider {...methods}>
        <form tabIndex={-1} onSubmit={handleSubmit(onAdvance)}>
          {form}
          {navButtons}
        </form>
      </FormProvider>
      <TransactionImporter />
    </>
  )
}

export default OtherInvestments
