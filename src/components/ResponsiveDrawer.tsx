import { Dispatch, Fragment, ReactElement, SetStateAction } from 'react'
import { useLocation, NavLink, Link } from 'react-router-dom'
import { isMobileOnly as isMobile } from 'react-device-detect'
import {
  useTheme,
  Divider,
  SwipeableDrawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  ListItemButton
} from '@mui/material'
import GitHubIcon from '@mui/icons-material/GitHub'
import TwitterIcon from '@mui/icons-material/Twitter'
import { Settings } from '@mui/icons-material'
import { styled } from '@mui/material/styles'
import Urls from 'ustaxes/data/urls'

const drawerWidth = 240

const PREFIX = 'ResponsiveDrawer'

const classes = {
  drawer: `${PREFIX}-drawer`,
  drawerBackdrop: `${PREFIX}-drawerBackdrop`,
  drawerContainer: `${PREFIX}-drawerContainer`,
  drawerPaper: `${PREFIX}-drawerPaper`,
  listSocial: `${PREFIX}-listSocial`,
  listItemSocial: `${PREFIX}-listItemSocial`,
  list: `${PREFIX}-list`,
  listItem: `${PREFIX}-listItem`,
  sectionHeader: `${PREFIX}-sectionHeader`
}

const Nav = styled('nav')(({ theme }) => ({
  [classes.drawer]: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0
    }
  },
  [classes.drawerBackdrop]: {
    top: isMobile ? '56px !important' : undefined,
    height: isMobile ? 'calc(100% - 56px)' : undefined
  },
  [classes.drawerContainer]: {
    top: isMobile ? '56px !important' : 0
  },
  [classes.drawerPaper]: {
    top: isMobile ? '56px !important' : undefined,
    width: isMobile ? '100%' : drawerWidth,
    height: isMobile ? 'calc(100% - 56px)' : undefined
  },
  [classes.listSocial]: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginRight: theme.spacing(2)
  },
  [classes.listItemSocial]: {
    flex: 0,
    padding: 0
  },
  [classes.list]: {
    marginLeft: theme.spacing(0),
    paddingLeft: theme.spacing(0)
  },
  [classes.listItem]: {
    marginLeft: theme.spacing(0),
    paddingLeft: theme.spacing(2)
  },
  [classes.sectionHeader]: {
    marginLeft: theme.spacing(2)
  }
}))

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
  const location = useLocation()
  const theme = useTheme()

  const { sections, isOpen, setOpen } = props

  const drawer = (
    <>
      {/* {isMobile && <Toolbar />} */}
      {sections.map(({ title, items }) => (
        <Fragment key={`section ${title}`}>
          <List
            subheader={<ListSubheader disableSticky>{title}</ListSubheader>}
            className={classes.list}
          >
            {items.map((item) => (
              <ListItemButton
                key={item.title}
                className={classes.listItem}
                href={item.url}
                selected={location.pathname === item.url}
                disabled={location.pathname === item.url}
              >
                <ListItemText primary={`${item.title}`} />
              </ListItemButton>
            ))}
          </List>
          <Divider />
        </Fragment>
      ))}
      <List className={classes.listSocial}>
        <ListItem className={classes.listItemSocial}>
          <IconButton
            color="secondary"
            aria-label="github, opens in new tab"
            component="a"
            href={`https://github.com/ustaxes/UsTaxes`}
            target="_blank"
            rel="noreferrer noopener"
            size="large"
          >
            <GitHubIcon />
          </IconButton>
        </ListItem>
        <ListItem className={classes.listItemSocial}>
          <IconButton
            color="secondary"
            aria-label="twitter, opens in new tab"
            component="a"
            href={`https://www.twitter.com/ustaxesorg`}
            target="_blank"
            rel="noreferrer noopener"
            size="large"
          >
            <TwitterIcon />
          </IconButton>
        </ListItem>
        <ListItem className={classes.listItemSocial}>
          <Link to={Urls.settings}>
            <IconButton
              color="secondary"
              aria-label="site user settings"
              size="large"
            >
              <Settings />
            </IconButton>
          </Link>
        </ListItem>
      </List>
    </>
  )

  return (
    <Nav className={classes.drawer} aria-label="primary">
      <SwipeableDrawer
        variant={!isMobile ? 'persistent' : undefined}
        anchor={theme.direction === 'rtl' ? 'right' : 'left'}
        open={isOpen}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        classes={{
          root: classes.drawerContainer,
          paper: classes.drawerPaper
        }}
        ModalProps={{
          BackdropProps: {
            classes: { root: classes.drawerBackdrop }
          }
          // Disabling for the time being due to scroll position persisting
          // keepMounted: isMobile ? true : false // Better open performance on mobile.
        }}
      >
        {drawer}
      </SwipeableDrawer>
    </Nav>
  )
}

export default ResponsiveDrawer
