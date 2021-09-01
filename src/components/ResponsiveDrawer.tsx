import { ReactElement } from 'react'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import {
  createStyles,
  makeStyles,
  useTheme,
  Theme,
  Toolbar,
  IconButton
} from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub'
import TwitterIcon from '@material-ui/icons/Twitter'
import { NavLink, useLocation } from 'react-router-dom'
import { useDevice } from 'ustaxes/hooks/Device'

const drawerWidth = 240

const useStyles = makeStyles<Theme, { isMobile: boolean }>((theme) =>
  createStyles({
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0
      }
    },
    drawerPaper: ({ isMobile }) => ({
      width: isMobile ? '100%' : drawerWidth
    }),
    listSocial: {
      display: 'flex',
      justifyContent: 'flex-end',
      marginRight: theme.spacing(2)
    },
    listItemSocial: {
      flex: 0,
      padding: 0
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

export interface Section {
  title: string
  items: SectionItem[]
}

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

export interface DrawerItemsProps {
  sections: Section[]
  isOpen: boolean
  onClose: () => void
}

function ResponsiveDrawer(props: DrawerItemsProps): ReactElement {
  const { isMobile } = useDevice()
  const location = useLocation()
  const classes = useStyles({ isMobile })
  const theme = useTheme()

  const { sections, isOpen, onClose } = props

  const drawer = (
    <>
      {isMobile && <Toolbar />}
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
      <div>
        <List className={classes.listSocial}>
          <ListItem className={classes.listItemSocial}>
            <IconButton
              color="inherit"
              aria-label="github, opens in new tab"
              component="a"
              href={`https://github.com/ustaxes/UsTaxes`}
              target="_blank"
              rel="noreferrer noopener"
            >
              <GitHubIcon />
            </IconButton>
          </ListItem>
          <ListItem className={classes.listItemSocial}>
            <IconButton
              color="inherit"
              aria-label="twitter, opens in new tab"
              component="a"
              href={`https://www.twitter.com/ustaxesorg`}
              target="_blank"
              rel="noreferrer noopener"
            >
              <TwitterIcon />
            </IconButton>
          </ListItem>
        </List>
      </div>
    </>
  )

  return (
    <nav className={classes.drawer} aria-label="primary">
      <Drawer
        variant="persistent"
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
