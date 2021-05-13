import React, { Fragment, ReactElement } from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, makeStyles, Typography } from '@material-ui/core'
import { PagerContext } from './pager'
import { create1040 } from '../irsForms/Main'
import { useSelector } from 'react-redux'
import { Information, TaxesState } from '../redux/data'
import { Check, Close } from '@material-ui/icons'
import { Currency } from './input'
import Alert from '@material-ui/lab/Alert'
import { isLeft } from '../util'

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

const BinaryStateListItem = ({ active, children }: BinaryStateListItemProps): ReactElement => {
  const classes = useStyles()

  return (
    <ListItem className={active ? classes.active : classes.inactive}>
      <ListItemAvatar>
        <ListItemIcon>
          {active ? <Check /> : <Close />}
        </ListItemIcon>
      </ListItemAvatar>
      {children}
    </ListItem>
  )
}

const Summary = (): ReactElement => {
  const state: Information = useSelector((state: TaxesState) => state.information)
  const classes = useStyles()

  return (
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <form onSubmit={onAdvance}>
          <h2>Summary</h2>
          {(() => {
            if (state.taxPayer.primaryPerson === undefined) {
              return (
                <h4>No data entered yet</h4>
              )
            } else {
              const f1040Result = create1040(state)

              if (isLeft(f1040Result)) {
                const errors = f1040Result.left

                return (
                  <Fragment>
                    {errors.map((error, i) => <Alert key={i} severity="warning">{error}</Alert>)}
                  </Fragment>
                )
              }

              const [f1040] = f1040Result.right

              return (
                <Fragment>
                  <h4>Credits</h4>
                  <List>
                    <BinaryStateListItem active={f1040.scheduleEIC?.allowed(f1040) ?? false} >
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
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                            >
                              {
                                f1040.scheduleEIC?.qualifyingDependents().map((d, i) =>
                                  <span key={i}>{`${d?.firstName ?? ''} ${d?.lastName ?? ''}`}</span>
                                )
                              }
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                            >
                              Credit: <Currency value={Math.round(f1040.scheduleEIC?.credit(f1040) ?? 0)} />
                            </Typography>
                          </React.Fragment>
                        }
                      />
                    </BinaryStateListItem>
                  </List>
                </Fragment>
              )
            }
          })()}
          {navButtons}
       </form>
      }
    </PagerContext.Consumer>
  )
}

export default Summary
