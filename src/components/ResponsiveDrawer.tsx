import React, { ReactElement } from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { createStyles, makeStyles, useTheme } from '@material-ui/core/styles'
import { NavLink, useLocation } from 'react-router-dom'
import { useDevice } from 'ustaxes/hooks/Device'

const drawerWidth = 240

const useStyles = makeStyles((theme) =>
  createStyles({
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
  })
)

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
  const { isMobile } = useDevice()
  const location = useLocation()
  const classes = useStyles()
  const theme = useTheme()

  const { sections, isOpen, onClose } = props

  const drawer = (
    <>
      {sections.map(({ title, items }) => (
        <div key={title}>
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
    </>
  )

  return (
    <nav className={classes.drawer} aria-label="primary">
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={isOpen}
        onClose={onClose}
        classes={{
          paper: classes.drawerPaper
        }}
        ModalProps={{
          keepMounted: isMobile ? true : false // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
    </nav>
  )
}

export default ResponsiveDrawer
