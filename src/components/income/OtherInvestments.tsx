import type { ReactElement } from 'react'
import { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import type { YearsTaxesState } from 'ustaxes/redux'
import { useDispatch } from 'ustaxes/redux'
import { useSelector } from 'react-redux'
import { addAsset } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import type { Asset, AssetType, HoldingPeriod, State } from 'ustaxes/core/data'
import { TaxYears } from 'ustaxes/core/data'
import {
  GenericLabeledDropdown,
  USStateDropDown,
  LabeledCheckbox,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { OpenableFormContainer } from 'ustaxes/components/FormContainer'
import { Grid } from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import { TransactionImporter } from './assets/TransactionImporter'
import FilteredAssetsTable from './assets/FilteredAssetsTable'
import { DatePicker } from '../input/DatePicker'
import { intentionallyFloat } from 'ustaxes/core/util'

const showAssetType = (p: AssetType): string => {
  switch (p) {
    case 'Security':
      return 'Security (Stock, bond, option, mutual fund, etc.)'
    case 'Real Estate':
      return 'Real Estate'
    case 'Digital Asset':
      return 'Digital Asset (Cryptocurrency, NFT, etc.)'
  }
}

interface AssetUserInput {
  name: string
  positionType: AssetType
  openDate?: Date
  variousOpenDates: boolean
  holdingPeriod?: HoldingPeriod
  closeDate?: Date
  openPrice: string
  closePrice?: string
  openFee: string
  closeFee: string
  quantity: string
  state?: State
}

const blankAssetUserInput: AssetUserInput = {
  name: '',
  positionType: 'Security',
  variousOpenDates: false,
  openPrice: '',
  openFee: '',
  closeFee: '',
  quantity: ''
}

const toAsset = (input: AssetUserInput): Asset<Date> | undefined => {
  const {
    name,
    openDate,
    variousOpenDates,
    holdingPeriod,
    closeDate,
    openPrice,
    closePrice,
    quantity,
    state,
    openFee,
    closeFee,
    positionType
  } = input
  if (name === '') {
    return undefined
  }
  if (variousOpenDates ? holdingPeriod === undefined : openDate === undefined) {
    return undefined
  }
  return {
    positionType,
    name,
    ...(variousOpenDates ? { holdingPeriod } : { openDate }),
    closeDate,
    openFee: Number(openFee),
    closeFee: Number(closeFee),
    openPrice: Number(openPrice),
    closePrice: Number(closePrice),
    quantity: input.positionType === 'Real Estate' ? 1 : Number(quantity),
    state
  }
}

export const OtherInvestments = (): ReactElement => {
  const year = useSelector((state: YearsTaxesState) => state.activeYear)
  const [isOpen, setOpen] = useState(false)
  const defaultValues = blankAssetUserInput
  const methods = useForm<AssetUserInput>({ defaultValues })
  const { handleSubmit, watch } = methods
  const positionType = watch('positionType')
  const openDate = watch('openDate')
  const variousOpenDates = watch('variousOpenDates')
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
      defaultValues={defaultValues}
      isOpen={isOpen}
      onOpenStateChange={setOpen}
      onSave={onSubmitAdd}
    >
      <Grid container spacing={2}>
        <h3>Add Assets</h3>
        <GenericLabeledDropdown<AssetType, AssetUserInput>
          label="Asset Type"
          name="positionType"
          dropDownData={['Security', 'Real Estate', 'Digital Asset']}
          keyMapping={(x) => x}
          textMapping={showAssetType}
          valueMapping={(x) => x}
        />
        <LabeledInput
          label={positionType === 'Real Estate' ? 'Address' : 'Name'}
          name="name"
        />
        <LabeledCheckbox
          label="Acquired on various dates, or date acquired is unknown"
          name="variousOpenDates"
        />
        {variousOpenDates ? (
          <GenericLabeledDropdown<HoldingPeriod, AssetUserInput>
            label="Holding period (as reported on Form 1099-B)"
            name="holdingPeriod"
            dropDownData={['Short Term', 'Long Term']}
            keyMapping={(x) => x}
            textMapping={(x) =>
              x === 'Short Term'
                ? 'Short term (held one year or less)'
                : 'Long term (held more than one year)'
            }
            valueMapping={(x) => x}
          />
        ) : (
          <DatePicker
            required
            maxDate={new Date()}
            label="Date acquired"
            name="openDate"
          />
        )}
        <DatePicker
          maxDate={new Date()}
          minDate={variousOpenDates ? undefined : openDate}
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
                  label="Price per unit"
                  patternConfig={Patterns.currency}
                  name="openPrice"
                />
                <LabeledInput
                  label="Quantity"
                  patternConfig={Patterns.number}
                  name="quantity"
                />
                <LabeledInput
                  label="Fee / comissions at purchase"
                  patternConfig={Patterns.number}
                  name="openFee"
                />
                <LabeledInput
                  label="Proceeds (sales price)"
                  patternConfig={Patterns.currency}
                  name="closePrice"
                />
                <LabeledInput
                  label="Fee / comissions at sale"
                  patternConfig={Patterns.number}
                  name="closeFee"
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
        <form
          tabIndex={-1}
          onSubmit={intentionallyFloat(handleSubmit(onAdvance))}
        >
          {form}
          {navButtons}
        </form>
      </FormProvider>
      <TransactionImporter />
    </>
  )
}

export default OtherInvestments
