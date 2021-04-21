import React, { ReactElement } from 'react'
import { List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, makeStyles, Typography } from '@material-ui/core'
import { PagerContext } from './pager'
import { create1040 } from '../irsForms/Main'
import { useSelector } from 'react-redux'
import { Information, TaxesState } from '../redux/data'
import { Check, Close } from '@material-ui/icons'

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

  const f1040 = create1040(state)

  const classes = useStyles()

  return (
    <PagerContext.Consumer>
      { ({ navButtons, onAdvance }) =>
        <form onSubmit={onAdvance}>
          <h2>Summary</h2>
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
                      className={classes.inline}
                      color="textPrimary"
                    >
                      {
                        f1040.scheduleEIC?.qualifyingDependents().map((d, i) =>
                          <span key={i}>{`${d?.firstName ?? ''} ${d?.lastName ?? ''}`}</span>
                        )
                      }
                    </Typography>
                  </React.Fragment>
                }
              />
            </BinaryStateListItem>
          </List>
          {navButtons}
       </form>
      }
    </PagerContext.Consumer>
  )
}

export default Summary
