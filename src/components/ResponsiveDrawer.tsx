import { Dispatch, ReactElement, SetStateAction } from 'react'
import { useLocation, NavLink } from 'react-router-dom'
import {
  createStyles,
  makeStyles,
  useTheme,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Theme,
  Toolbar
} from '@material-ui/core'
import GitHubIcon from '@material-ui/icons/GitHub'
import TwitterIcon from '@material-ui/icons/Twitter'
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
  setOpen: Dispatch<SetStateAction<boolean>>
}

function ResponsiveDrawer(props: DrawerItemsProps): ReactElement {
  const { isMobile } = useDevice()
  const location = useLocation()
  const classes = useStyles({ isMobile })
  const theme = useTheme()

  const { sections, isOpen, setOpen } = props

  const drawer = (
    <>
      {isMobile && <Toolbar />}
      {sections.map(({ title, items }) => (
        <>
          <List
            subheader={<ListSubheader disableSticky>{title}</ListSubheader>}
            className={classes.list}
          >
            {items.map((item) => (
              <ListItem
                key={item.title}
                className={classes.listItem}
                button
                component={NavLink}
                exact
                activeClassName="current"
                to={item.url}
                selected={location.pathname === item.url}
                disabled={location.pathname === item.url}
              >
                <ListItemText primary={`${item.title}`} />
              </ListItem>
            ))}
          </List>
          <Divider />
        </>
      ))}
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
    </>
  )

  return (
    <nav className={classes.drawer} aria-label="primary">
      <Drawer
        variant="persistent"
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={isOpen}
        onClose={() => setOpen(false)}
        classes={{
          paper: classes.drawerPaper
        }}
        ModalProps={{
          disableAutoFocus: false,
          disableEnforceFocus: true,
          keepMounted: isMobile ? true : false // Better open performance on mobile.
        }}
      >
        {drawer}
      </Drawer>
    </nav>
  )
}

export default ResponsiveDrawer
