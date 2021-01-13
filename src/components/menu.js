import React from 'react'
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

function ResponsiveDrawer (props) {
  const location = useLocation()
  const classes = useStyles()
  const theme = useTheme()
  const [mobileOpen, setMobileOpen] = React.useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const drawer = (
    <div>
      <h2>
                Wages
      </h2>

      <Divider />
      <List>
        <ListItem
          button
          key='Employer Information'
          component={NavLink}
          exact activeClassName="current"
          to="/w2employerinfo"
          selected={location.pathname === '/w2employerinfo'}
        >
          <ListItemText primary='Employer Information' />
        </ListItem>

        <ListItem
          button
          key='Employee Information'
          component={NavLink}
          exact activeClassName="current"
          to="/w2employeeinfo"
          selected={location.pathname === '/w2employeeinfo'}
        >
          <ListItemText primary='Employee Information' />
        </ListItem>

        <ListItem
          button
          key='Job Information'
          component={NavLink}
          exact activeClassName="current"
          to="/w2jobinfo"
          selected={location.pathname === '/w2jobinfo'}
        >
          <ListItemText primary='Job Information' />
        </ListItem>
      </List>

      <Divider />
      <h2>
                Personal
      </h2>
      <Divider />

      <List>
        <ListItem
          button
          key='Submit'
          component={NavLink}
          exact activeClassName="current"
          to="/familyinfo"
          selected={location.pathname === '/familyinfo'}
        >
          <ListItemText primary='Family Information' />
        </ListItem>
      </List>

      <Divider />

      <List>
        <ListItem
          button
          key='Submit'
          component={NavLink}
          exact activeClassName="current"
          to="/createPDF"
          selected={location.pathname === '/createPDF'}
        >
          <ListItemText primary='Review and Print' />
        </ListItem>
      </List>
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
