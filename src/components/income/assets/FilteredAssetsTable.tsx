import { Button, Grid } from '@material-ui/core'
import { ReactElement, useMemo, useState } from 'react'
import DataTable, { TableColumn } from 'react-data-table-component'
import { FormProvider, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  Currency,
  GenericLabeledDropdown,
  LabeledInput
} from 'ustaxes/components/input'
import { Asset, AssetType, TaxYear, TaxYears } from 'ustaxes/core/data'
import { enumKeys } from 'ustaxes/core/util'
import { YearsTaxesState } from 'ustaxes/redux'
import * as actions from 'ustaxes/redux/actions'
import AssetSummary from './AssetSummary'

type CloseYear = TaxYear | 'none' | 'all'
interface AssetFilter {
  securityName: string
  positionType: AssetType
  closeYear: string | undefined
}

const blankFilter: AssetFilter = {
  securityName: '',
  positionType: 'Security',
  closeYear: 'none'
}

type Row = WithIndex<Asset<Date>>
const assetTableColumns: TableColumn<Row>[] = [
  {
    name: 'Security',
    selector: ({ name }) => name,
    sortable: true
  },
  {
    name: 'Open Date',
    selector: ({ openDate }) => openDate?.toISOString().slice(0, 10) ?? '',
    sortable: true
  },
  {
    name: 'Sale Date',
    selector: ({ closeDate }) => closeDate?.toISOString().slice(0, 10) ?? '',
    sortable: true
  },
  {
    name: 'Cost basis',
    sortFunction: (a, b) => a.openPrice * a.quantity - b.openPrice * b.quantity,
    cell: ({ openPrice, quantity }) => (
      <Currency value={openPrice * quantity} />
    ),
    sortable: true
  },
  {
    name: 'Proceeds',
    sortFunction: (a, b) =>
      (a.closePrice ?? 0) * a.quantity - (b.closePrice ?? 0) * b.quantity,
    cell: ({ closePrice, quantity }) =>
      closePrice !== undefined ? (
        <Currency value={closePrice * quantity} />
      ) : (
        ''
      ),
    sortable: true
  }
]

type SelectionEvent<T> = {
  allSelected: boolean
  selectedCount: number
  selectedRows: T[]
}

type WithIndex<A> = {
  idx: number
} & A

interface DisplayAssetsProps {
  assets: WithIndex<Asset<Date>>[]
  deleteRows: (rows: number[]) => void
}

const DisplayAssets = ({
  assets,
  deleteRows
}: DisplayAssetsProps): ReactElement => {
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const [cleared, setCleared] = useState(false)

  const handleRowSelected = (event: SelectionEvent<WithIndex<Asset<Date>>>) => {
    setSelectedRows(event.selectedRows.map(({ idx }) => idx))
  }

  const contextActions = useMemo(() => {
    const handleDelete = () => {
      const promptResult = window.confirm(
        `Are you sure you want to delete ${selectedRows.length} positions?`
      )
      if (promptResult) {
        setCleared(!cleared)
        deleteRows(selectedRows)
      }
    }

    return (
      <Button
        variant="contained"
        color="primary"
        onClick={handleDelete}
        style={{ backgroundColor: 'red' }}
      >
        Delete
      </Button>
    )
  }, [selectedRows, cleared])

  return (
    <DataTable
      title="Assets"
      columns={assetTableColumns}
      data={assets}
      selectableRows
      pagination
      onSelectedRowsChange={handleRowSelected}
      contextActions={contextActions}
      clearSelectedRows={cleared}
    />
  )
}

const FilteredAssetsTable = (): ReactElement => {
  const activeYear: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )
  const dispatch = useDispatch()
  const assets = useSelector((state: YearsTaxesState) => state.assets)
  const allAssets: WithIndex<Asset<Date>>[] = assets.map((a, i) => ({
    ...a,
    idx: i
  }))
  const methods = useForm<AssetFilter>({
    defaultValues: { ...blankFilter, closeYear: activeYear }
  })
  const closeYear = methods.watch('closeYear')
  const securityName = methods.watch('securityName')

  const yearFilter = (a: Asset<Date>): boolean =>
    closeYear === 'all' ||
    (a.closeDate === undefined && closeYear === 'none') ||
    (a.closeDate !== undefined &&
      closeYear !== 'none' &&
      a.closeDate.getFullYear() === TaxYears[closeYear as TaxYear])

  const securityFilter = (a: Asset<Date>): boolean =>
    securityName === '' || a.name.toLowerCase() === securityName.toLowerCase()

  const displayAssets = allAssets.filter(
    (a) => yearFilter(a) && securityFilter(a)
  )

  const title = [
    ['Summary of'],
    securityName !== '' ? [securityName] : [],
    closeYear === 'all'
      ? ['all time']
      : closeYear === 'none'
      ? ['current holdings']
      : [`sales in ${TaxYears[closeYear as TaxYear]}`]
  ]
    .flat()
    .join(' ')

  return (
    <>
      <FormProvider {...methods}>
        <Grid container direction="row" spacing={2}>
          <LabeledInput
            sizes={{ xs: 6 }}
            label="Security"
            name="securityName"
          />
          <GenericLabeledDropdown<[string, CloseYear]>
            sizes={{ xs: 6 }}
            label="Sale Year"
            name="closeYear"
            dropDownData={[
              ['All', 'all'],
              ['Still open', 'none'],
              ...enumKeys(TaxYears).map<[string, TaxYear]>((x) => [
                TaxYears[x].toString(),
                x
              ])
            ]}
            keyMapping={(x) => x[1].toString()}
            valueMapping={(x) => x[1] ?? 'all'}
            textMapping={(x) => x[0]}
          />
        </Grid>
      </FormProvider>
      <AssetSummary title={title} assets={displayAssets} />
      <DisplayAssets
        assets={displayAssets}
        deleteRows={(rows) => dispatch(actions.removeAssets(rows)(activeYear))}
      />
    </>
  )
}

export default FilteredAssetsTable
