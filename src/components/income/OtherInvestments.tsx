import { ReactElement } from 'react'
import { Helmet } from 'react-helmet'
import { useForm, FormProvider } from 'react-hook-form'
import { useDispatch, YearsTaxesState } from 'ustaxes/redux'
import { useSelector } from 'react-redux'
import { addAsset, editAsset, removeAsset } from 'ustaxes/redux/actions'
import { usePager } from 'ustaxes/components/pager'
import { Asset, State } from 'ustaxes/core/data'
import {
  GenericLabeledDropdown,
  USStateDropDown,
  LabeledInput
} from 'ustaxes/components/input'
import { Patterns } from 'ustaxes/components/Patterns'
import { FormListContainer } from 'ustaxes/components/FormContainer'
import { DatePicker } from '../input/DatePicker'
import { Grid } from '@material-ui/core'

type AssetType = 'Security' | 'Real Estate'

interface Show<A> {
  (a: A): string
}

const toShow = <A,>(f: (a: A) => string): Show<A> => f

const show =
  <A,>(shows: Show<A>) =>
  (a: A): string =>
    shows(a)

const showAssetType: Show<AssetType> = toShow((p) => {
  switch (p) {
    case 'Security':
      return 'Security (Stock, bond, option, mutual fund, etc.)'
    case 'Real Estate':
      return 'Real Estate'
  }
})

interface AssetUserInput {
  name: string
  positionType: AssetType
  openDate?: Date
  closeDate?: Date
  openPrice: string
  closePrice: string
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
  const { name, openDate, closeDate, openPrice, closePrice, quantity, state } =
    input
  if (name === '' || openDate === undefined) {
    return undefined
  }
  return {
    name,
    openDate,
    closeDate,
    openPrice: Number(openPrice),
    closePrice: Number(closePrice),
    quantity: Number(quantity),
    state
  }
}

export default function OtherInvestments(): ReactElement {
  const assets = useSelector((state: YearsTaxesState) => state.assets)

  const methods = useForm<AssetUserInput>()
  const { handleSubmit, watch } = methods
  const positionType = watch('positionType')
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
      primary={(f) => f.name}
      secondary={(f) =>
        `${f.openDate?.toDateString() ?? ''}: ${f.quantity} @ $${f.openPrice}`
      }
    >
      {' '}
      <Grid container spacing={2}>
        <p>Manage Assets</p>
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
          patternConfig={Patterns.name}
          name="name"
        />
        <DatePicker
          maxDate={new Date(2021, 12, 31)}
          label={positionType === 'Real Estate' ? 'Purchase date' : 'Open Date'}
          name="openDate"
        />
        <DatePicker
          maxDate={new Date(2021, 12, 31)}
          label={positionType === 'Real Estate' ? 'Sale date' : 'Close Date'}
          name="closeDate"
        />
        <LabeledInput
          label="Cost of acquisition"
          patternConfig={Patterns.currency}
          name="openPrice"
        />
        {(() => {
          if (positionType === 'Real Estate') {
            return (
              <>
                <LabeledInput
                  label="Net proceeds from sale"
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
                  label="Quantity"
                  patternConfig={Patterns.currency}
                  name="quantity"
                />
                <LabeledInput
                  label="Sell Price"
                  patternConfig={Patterns.currency}
                  name="closePrice"
                />
              </>
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
    </FormProvider>
  )
}
