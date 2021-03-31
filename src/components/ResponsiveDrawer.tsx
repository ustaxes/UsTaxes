import React, { ReactElement } from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import {
  NavLink,
  useLocation
} from 'react-router-dom'

const drawerWidth = 240

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex'
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  appBar: {
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth
    }
  },
  menuButton: {
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  },
  // necessary for content to be below app bar
  toolbar: theme.mixins.toolbar,
  drawerPaper: {
    width: drawerWidth
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3)
  }
}))

export interface SectionItem {
  title: string
  url: string
  element: ReactElement
}

export const item = (title: string, url: string, element: ReactElement): SectionItem => ({
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
}

function ResponsiveDrawer (props: DrawerItemsProps): ReactElement {
  const location = useLocation()
  const classes = useStyles()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen)
  }

  const { sections } = props

  const drawer = (
    <div>
      {
        sections.map(({ title, items }, sectionIdx) => (
          <div key={sectionIdx}>
            <h2>{title}</h2>
            <List>
              {items.map((item, itemIdx) =>
                <ListItem
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
              )}
            </List>
            <Divider />
          </div>
        ))
      }
    </div>
  )

  return (
    <div className={classes.root}>
      <nav className={classes.drawer} aria-label="mailbox folders">
        {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={theme.direction === 'rtl' ? 'right' : 'left'}
            open={mobileOpen}
            onClose={handleDrawerToggle}
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
    </div>
  )
}

export default ResponsiveDrawer
