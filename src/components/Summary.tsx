import React, { Fragment, ReactElement } from 'react'
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Typography
} from '@material-ui/core'
import { usePager } from './pager'
import { create1040 } from 'ustaxes/irsForms/Main'
import { useSelector } from 'react-redux'
import { Information, TaxesState } from 'ustaxes/redux/data'
import { Check, Close } from '@material-ui/icons'
import F1040 from 'ustaxes/irsForms/F1040'
import { Currency } from './input'
import Alert from '@material-ui/lab/Alert'
import { isLeft } from 'ustaxes/util'

interface BinaryStateListItemProps {
  active: boolean
  children: string | ReactElement | ReactElement[]
}

const useStyles = makeStyles((theme) => ({
  active: {
    backgroundColor: 'white',
    borderStyle: '2px solid green'
  },
  inactive: {
    backgroundColor: 'light-grey'
  },
  root: {
    width: '100%',
    maxWidth: '36ch',
    backgroundColor: theme.palette.background.paper
  },
  inline: {
    display: 'inline'
  },
  block: {
    display: 'block'
  }
}))

const BinaryStateListItem = ({
  active,
  children
}: BinaryStateListItemProps): ReactElement => {
  const classes = useStyles()

  return (
    <ListItem className={active ? classes.active : classes.inactive}>
      <ListItemAvatar>
        <ListItemIcon>{active ? <Check /> : <Close />}</ListItemIcon>
      </ListItemAvatar>
      {children}
    </ListItem>
  )
}

interface F1040Props {
  f1040: F1040
}

const F1040Summary = ({ f1040 }: F1040Props): ReactElement => {
  const classes = useStyles()

  const earnedIncomeTaxCredit = (
    <BinaryStateListItem active={f1040.scheduleEIC?.allowed(f1040) ?? false}>
      <ListItemText
        primary="Earned Income Tax Credit"
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              variant="body2"
              color="textPrimary"
              className={classes.block}
            >
              Qualifying Dependents:
            </Typography>
            <Typography component="span" variant="body2" color="textSecondary">
              {f1040.scheduleEIC?.qualifyingDependents().map((d, i) => (
                <span key={i}>{`${d?.firstName ?? ''} ${
                  d?.lastName ?? ''
                }`}</span>
              ))}
            </Typography>
            <br />
            <Typography component="span" variant="body2" color="textPrimary">
              Credit:{' '}
              <Currency
                value={Math.round(f1040.scheduleEIC?.credit(f1040) ?? 0)}
              />
            </Typography>
          </React.Fragment>
        }
      />
    </BinaryStateListItem>
  )

  const creditForChildrenAndOtherDependents = (
    <BinaryStateListItem
      active={f1040.childTaxCreditWorksheet?.isAllowed() ?? false}
    >
      <ListItemText
        primary="Credit for children and other dependents"
        secondary={
          <React.Fragment>
            <Typography component="span" variant="body2" color="textPrimary">
              Credit:{' '}
              <Currency
                value={Math.round(f1040.childTaxCreditWorksheet?.credit() ?? 0)}
              />
            </Typography>
          </React.Fragment>
        }
      />
    </BinaryStateListItem>
  )

  return (
    <Fragment>
      <h4>Credits</h4>
      <List>
        {earnedIncomeTaxCredit}
        {creditForChildrenAndOtherDependents}
      </List>
    </Fragment>
  )
}

const Summary = (): ReactElement => {
  const information: Information = useSelector(
    (state: TaxesState) => state.information
  )

  const { onAdvance, navButtons } = usePager()

  const summaryBody = (() => {
    if (information.taxPayer.primaryPerson === undefined) {
      return <h4>No data entered yet</h4>
    } else {
      const f1040Result = create1040(information)

      if (isLeft(f1040Result)) {
        const errors = f1040Result.left

        return (
          <Fragment>
            {errors.map((error, i) => (
              <Alert key={i} severity="warning">
                {error}
              </Alert>
            ))}
          </Fragment>
        )
      } else {
        const [f1040] = f1040Result.right
        return <F1040Summary f1040={f1040} />
      }
    }
  })()

  return (
    <form onSubmit={onAdvance}>
      <h2>Summary</h2>
      {summaryBody}
      {navButtons}
    </form>
  )
}

export default Summary
