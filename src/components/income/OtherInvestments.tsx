import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, YearsTaxesState } from 'ustaxes/redux'
import { useSelector } from 'react-redux'
import { addAsset, editAsset, removeAsset } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import { Asset, AssetType, State } from 'ustaxes/core/data'
import {
  GenericLabeledDropdown,
  USStateDropDown,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { Currency } from 'ustaxes/components/input'
import { DatePicker } from '../input/DatePicker'
import { Grid } from '@mui/material'
import {
  HouseOutlined as RealEstateIcon,
  ShowChartOutlined as StockIcon
} from '@mui/icons-material'
import { Alert } from '@mui/material'
import { TaxYears } from 'ustaxes/data'
import { TransactionImporter } from './TransactionImporter'

interface Show<A> {
  (a: A): string
}

const show =
  <A,>(shows: Show<A>) =>
  (a: A): string =>
    shows(a)

const showAssetType: Show<AssetType> = (p) => {
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

const blankUserInput: AssetUserInput = {
  name: '',
  positionType: 'Security',
  openPrice: '',
  closePrice: '',
  quantity: ''
}

const toUserInput = (f: Asset<Date>): AssetUserInput => ({
  ...blankUserInput,
  ...f,
  openPrice: f.openPrice.toString(),
  closePrice: f.closePrice?.toString() ?? '',
  quantity: f.quantity.toString()
})

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

export default function OtherInvestments(): ReactElement {
  const assets = useSelector((state: YearsTaxesState) => state.assets)
  const year = useSelector((state: YearsTaxesState) => state.activeYear)

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

  const onSubmitEdit =
    (index: number) =>
    (formData: AssetUserInput): void => {
      const payload = toAsset(formData)
      if (payload !== undefined) {
        dispatch(editAsset({ value: payload, index }))
      }
    }

  const form: ReactElement | undefined = (
    <FormListContainer<AssetUserInput>
      onSubmitAdd={onSubmitAdd}
      onSubmitEdit={onSubmitEdit}
      items={assets.map((a) => toUserInput(a))}
      removeItem={(i) => dispatch(removeAsset(i))}
      icon={(a) =>
        a.positionType === 'Real Estate' ? <RealEstateIcon /> : <StockIcon />
      }
      primary={(f) => f.name}
      secondary={(f) => {
        const asset = toAsset(f)
        if (asset === undefined) return ''
        const dates = `${asset.openDate?.toLocaleDateString() ?? ''}-${
          asset.closeDate?.toLocaleDateString() ?? ''
        }`
        const money =
          asset.closeDate === undefined || asset.closePrice === undefined
            ? asset.openPrice * asset.quantity
            : (asset.closePrice - asset.openPrice) * asset.quantity
        const moneyEl = (
          <Currency plain={asset.closeDate === undefined} value={money} />
        )
        return (
          <span>
            {dates}: {moneyEl}
          </span>
        )
      }}
    >
      {' '}
      <Grid container spacing={2}>
        <h3>Manage Assets</h3>
        <GenericLabeledDropdown<AssetType>
          label="Asset Type"
          name="positionType"
          dropDownData={['Security', 'Real Estate']}
          keyMapping={(x) => x}
          textMapping={show(showAssetType)}
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
    </FormListContainer>
  )

  return (
    <FormProvider {...methods}>
      <form tabIndex={-1} onSubmit={handleSubmit(onAdvance)}>
        <Helmet>
          <title>Other Investments | Income | UsTaxes.org</title>
        </Helmet>
        <h2>Other Investments</h2>
        {form}
        {navButtons}
      </form>
      <TransactionImporter />
    </FormProvider>
  )
}
