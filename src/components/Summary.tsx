import { ReactElement } from 'react'
import { Avatar, Grid, List, Typography } from '@material-ui/core'
import { create1040 } from 'ustaxes/forms/Y2020/irsForms/Main'
import { useSelector, TaxesState } from 'ustaxes/redux'
import { Information } from 'ustaxes/core/data'
import { Check, Close } from '@material-ui/icons'
import F1040 from 'ustaxes/forms/Y2020/irsForms/F1040'
import { Currency } from './input'
import Alert from '@material-ui/lab/Alert'
import { isLeft } from 'ustaxes/core/util'

interface BinaryStateListItemProps {
  active: boolean
  children: string | ReactElement | ReactElement[]
}

const BinaryStateListItem = ({
  active,
  children
}: BinaryStateListItemProps): ReactElement => {
  return (
    <Grid container spacing={3}>
      <Grid item style={{ margin: 'auto' }}>
        <Avatar>
          {active ? (
            <Check titleAccess="Eligible" />
          ) : (
            <Close titleAccess="Ineligible" />
          )}
        </Avatar>
      </Grid>
      <Grid item xs zeroMinWidth>
        {children}
      </Grid>
    </Grid>
  )
}

interface F1040Props {
  f1040: F1040
}

const F1040Summary = ({ f1040 }: F1040Props): ReactElement => {
  const qualifyingDependents = f1040.scheduleEIC?.qualifyingDependents()
  const earnedIncomeTaxCredit = (
    <BinaryStateListItem active={f1040.scheduleEIC?.allowed(f1040) ?? false}>
      <>
        <Typography color="textPrimary">Earned Income Tax Credit</Typography>
        {qualifyingDependents && (
          <>
            <Typography variant="body2" color="textPrimary">
              Qualifying Dependents:
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {f1040.scheduleEIC
                ?.qualifyingDependents()
                .map((d) => `${d?.firstName ?? ''} ${d?.lastName ?? ''}`)
                .join(', ')}
            </Typography>
          </>
        )}
        <Typography variant="body2" color="textPrimary">
          Credit:{' '}
          <Currency value={Math.round(f1040.scheduleEIC?.credit(f1040) ?? 0)} />
        </Typography>
      </>
    </BinaryStateListItem>
  )

  const creditForChildrenAndOtherDependents = (
    <BinaryStateListItem
      active={f1040.childTaxCreditWorksheet?.isAllowed() ?? false}
    >
      <Typography color="textPrimary">
        Credit for children and other dependents
      </Typography>
      <Typography variant="body2" color="textPrimary">
        Credit:{' '}
        <Currency
          value={Math.round(f1040.childTaxCreditWorksheet?.credit() ?? 0)}
        />
      </Typography>
    </BinaryStateListItem>
  )

  return (
    <>
      <h3>Credits</h3>
      <Grid container>
        <Grid item zeroMinWidth>
          <List>
            <li>{earnedIncomeTaxCredit}</li>
            <li>{creditForChildrenAndOtherDependents}</li>
          </List>
        </Grid>
      </Grid>
    </>
  )
}

const Summary = (): ReactElement => {
  const information: Information = useSelector(
    (state: TaxesState) => state.information
  )

  const summaryBody = (() => {
    if (information.taxPayer.primaryPerson === undefined) {
      return <p>No data entered yet</p>
    } else {
      const f1040Result = create1040(information)

      if (isLeft(f1040Result)) {
        const errors = f1040Result.left

        return (
          <>
            {errors.map((error, i) => (
              <Alert key={i} severity="warning">
                {error}
              </Alert>
            ))}
          </>
        )
      } else {
        const [f1040] = f1040Result.right
        return <F1040Summary f1040={f1040} />
      }
    }
  })()

  return (
    <div>
      <h2>Summary</h2>
      {summaryBody}
    </div>
  )
}

export default Summary
