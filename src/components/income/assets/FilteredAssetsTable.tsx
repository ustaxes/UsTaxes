import { Button, Grid, useMediaQuery } from '@material-ui/core'
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
    selector: ({ openDate }) => openDate.toISOString().slice(0, 10),
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
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

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
      theme={prefersDarkMode ? 'dark' : 'normal'}
    />
  )
}

const FilteredAssetsTable = (): ReactElement => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
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

  const filterForm = (() => {
    // Show filter if there are any assets to filter from
    if (assets.length > 0) {
      return (
        <FormProvider {...methods}>
          <h3>Filter by</h3>
          <Grid container direction="row" spacing={2}>
            <LabeledInput
              sizes={{ xs: 6 }}
              label="Asset Name"
              name="securityName"
            />
            <GenericLabeledDropdown<[string, CloseYear], AssetFilter>
              noUndefined
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
              valueMapping={(x) => x[1]}
              textMapping={(x) => x[0]}
            />
          </Grid>
        </FormProvider>
      )
    }
  })()

  const assetSummary = (() => {
    if (assets.length > 0) {
      return <AssetSummary title={title} assets={displayAssets} />
    }
  })()

  const asCsv = (): string[] =>
    [
      [
        'Security',
        'Quantity',
        'Open Date',
        'Open Price',
        'Open Fee',
        'Cost basis',
        'Close Date',
        'Close Price',
        'Close Fee',
        'Proceeds',
        'Gain / Loss'
      ],
      ...displayAssets.map((a) => [
        a.name,
        a.quantity,
        a.openDate.toISOString().slice(0, 10),
        a.openPrice,
        a.openFee,
        a.openPrice * a.quantity + a.openFee,
        a.closeDate?.toISOString().slice(0, 10) ?? '',
        a.closePrice,
        a.closeFee,
        a.closePrice === undefined
          ? ''
          : a.closePrice * a.quantity - (a.closeFee ?? 0),
        a.closePrice === undefined
          ? ''
          : (a.closePrice - a.openPrice) * a.quantity -
            (a.closeFee ?? 0) -
            a.openFee
      ])
    ].map((line) => line.join(','))

  const exportView = (() => {
    if (displayAssets.length > 0) {
      return (
        <Grid item>
          <Button
            color={prefersDarkMode ? 'default' : 'secondary'}
            variant="contained"
            onClick={() => {
              const csv = asCsv().join('\n')
              const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
              const url = URL.createObjectURL(blob)
              const link = document.createElement('a')
              link.setAttribute('href', url)
              link.setAttribute('download', 'assets.csv')
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }}
          >
            Export {displayAssets.length} Assets
          </Button>
        </Grid>
      )
    }
  })()

  return (
    <Grid container spacing={1} direction="column">
      <Grid item>{filterForm}</Grid>
      <Grid item>{assetSummary}</Grid>
      {exportView}

      <Grid item>
        <DisplayAssets
          assets={displayAssets}
          deleteRows={(rows) =>
            dispatch(actions.removeAssets(rows)(activeYear))
          }
        />
      </Grid>
    </Grid>
  )
}

export default FilteredAssetsTable
