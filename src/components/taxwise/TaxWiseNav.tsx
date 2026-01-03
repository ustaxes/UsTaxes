import { ReactElement } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Divider,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  makeStyles
} from '@material-ui/core'
import { TaxWiseSection } from './routes'

const useStyles = makeStyles((theme) => ({
  list: {
    paddingTop: 0,
    paddingBottom: 0
  },
  sectionHeader: {
    backgroundColor: 'transparent',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: theme.palette.text.secondary
  },
  item: {
    paddingTop: theme.spacing(0.75),
    paddingBottom: theme.spacing(0.75)
  },
  active: {
    backgroundColor: '#e8eef6',
    borderLeft: '3px solid #1b3a57'
  }
}))

type TaxWiseNavProps = {
  sections: TaxWiseSection[]
  onNavigate?: () => void
}

const TaxWiseNav = ({
  sections,
  onNavigate
}: TaxWiseNavProps): ReactElement => {
  const classes = useStyles()
  const location = useLocation()

  return (
    <div>
      {sections.map((section) => (
        <div key={section.title}>
          <List
            className={classes.list}
            subheader={
              <ListSubheader className={classes.sectionHeader}>
                {section.title}
              </ListSubheader>
            }
          >
            {section.items.map((item) => (
              <ListItem
                key={item.title}
                button
                component={NavLink}
                to={item.url}
                onClick={onNavigate}
                className={classes.item}
                classes={{
                  selected: classes.active
                }}
                selected={location.pathname === item.url}
              >
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </div>
      ))}
    </div>
  )
}

export default TaxWiseNav
