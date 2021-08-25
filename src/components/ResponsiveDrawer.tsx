import React, { Fragment, ReactElement } from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { NavLink, useLocation } from 'react-router-dom'

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  drawerPaper: {
    width: drawerWidth
  },
  list: {
    marginLeft: theme.spacing(0),
    paddingLeft: theme.spacing(0)
  },
  listItem: {
    marginLeft: theme.spacing(0),
    paddingLeft: theme.spacing(2)
  },
  sectionHeader: {
    marginLeft: theme.spacing(2)
  }
}))

export interface SectionItem {
  title: string
  url: string
  element: ReactElement
}

export const item = (
  title: string,
  url: string,
  element: ReactElement
): SectionItem => ({
  title,
  url,
  element
})

export interface Section {
  title: string
  items: SectionItem[]
}

export interface DrawerItemsProps {
  sections: Section[]
  isOpen: boolean
  onClose: () => void
}

function ResponsiveDrawer(props: DrawerItemsProps): ReactElement {
  const location = useLocation()
  const classes = useStyles()
  const theme = useTheme()

  const { sections, isOpen, onClose } = props

  const drawer = (
    <Fragment>
      {sections.map(({ title, items }, sectionIdx) => (
        <div key={sectionIdx}>
          <List className={classes.list}>
            <h2 className={classes.sectionHeader}>{title}</h2>
            {items.map((item, itemIdx) => (
              <ListItem
                className={classes.listItem}
                button
                key={itemIdx}
                component={NavLink}
                exact
                activeClassName="current"
                to={item.url}
                selected={location.pathname === item.url}
              >
                <ListItemText primary={item.title} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </div>
      ))}
    </Fragment>
  )

  return (
    <nav className={classes.drawer} aria-label="mailbox folders">
      {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
      <Hidden smUp implementation="css">
        <Drawer
          variant="temporary"
          anchor={theme.direction === 'rtl' ? 'right' : 'left'}
          open={isOpen}
          onClose={onClose}
          classes={{
            paper: classes.drawerPaper
          }}
          ModalProps={{
            keepMounted: true // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
      </Hidden>
      <Hidden xsDown implementation="css">
        <Drawer
          classes={{
            paper: classes.drawerPaper
          }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </Hidden>
    </nav>
  )
}

export default ResponsiveDrawer
