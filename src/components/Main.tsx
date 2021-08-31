import { useMemo, ReactElement, ReactNode, PropsWithChildren } from 'react'
import {
  unstable_createMuiStrictModeTheme as createMuiTheme,
  useMediaQuery,
  makeStyles,
  createStyles,
  CssBaseline,
  Grid,
  Theme,
  ThemeProvider
} from '@material-ui/core'
import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import { PagerProvider } from './pager'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'
import Menu, { drawerSections } from './Menu'
import { Section, SectionItem } from './ResponsiveDrawer'

import { useDevice } from 'ustaxes/hooks/Device'
import Urls from 'ustaxes/data/urls'

type Props = {
  isMobile: boolean
}

const useStyles = makeStyles<Theme, Props>((theme: Theme) =>
  createStyles({
    main: {
      display: 'flex'
    },
    content: ({ isMobile }) => ({
      padding: '1em 2em',
      [theme.breakpoints.up('sm')]: {
        borderRadius: '5px',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 20px 30px',
        margin: theme.spacing(3),
        padding: '1em 2em'
      },
      width: isMobile ? '100%' : undefined
    }),
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
      [theme.breakpoints.up('sm')]: {
        display: 'none'
      }
    }
  })
)

export default function Main(): ReactElement {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          secondary: {
            light: '#4f5b62',
            main: '#BCD2EE',
            dark: '#000a12',
            contrastText: '#ffffff'
          },
          primary: {
            light: '#66ffa6',
            main: '#00e676',
            dark: '#00b248',
            contrastText: '#000000'
          }
        }
      }),
    [prefersDarkMode]
  )

  const { isMobile } = useDevice()
  const classes = useStyles({ isMobile })

  const allItems: SectionItem[] = drawerSections.flatMap(
    (section: Section) => section.items
  )

  const Layout = ({ children }: PropsWithChildren<{ children: ReactNode }>) => (
    <Grid container justifyContent="center" direction="row">
      <Grid item sm={12} md={8} lg={6} className={classes.content}>
        {children}
      </Grid>
    </Grid>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className={classes.toolbar} />
      <main className={classes.main}>
        <StateLoader />
        <PagerProvider pages={allItems}>
          <Switch>
            <Redirect path="/" to={Urls.default} exact />
            {allItems.map((item, index) => (
              <Route key={index} exact path={item.url}>
                {useLocation().pathname !== '/start' && <Menu />}
                <Layout>{item.element}</Layout>
              </Route>
            ))}
            <Route>
              <Layout>
                <NoMatchPage />
              </Layout>
            </Route>
          </Switch>
        </PagerProvider>
      </main>
    </ThemeProvider>
  )
}
