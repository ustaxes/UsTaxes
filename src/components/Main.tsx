import { useMemo, PropsWithChildren, ReactElement } from 'react'
import {
  createStyles,
  makeStyles,
  unstable_createMuiStrictModeTheme as createMuiTheme,
  useMediaQuery,
  CssBaseline,
  Grid,
  Theme,
  ThemeProvider
} from '@material-ui/core'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isMobileOnly as isMobile } from 'react-device-detect'
import { PagerProvider } from './pager'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'
import SkipToLinks from './SkipToLinks'
import ScrollTop from './ScrollTop'
import Menu, { drawerSections, backPages } from './Menu'
import { Section, SectionItem } from './ResponsiveDrawer'

import Urls from 'ustaxes/data/urls'
import DataPropagator from './DataPropagator'
import YearStatusBar from './YearStatusBar'

type Props = {
  isMobile: boolean
}

const useStyles = makeStyles<Theme, Props>((theme: Theme) =>
  createStyles({
    container: {
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
          secondary: prefersDarkMode
            ? {
                light: '#4f5b62',
                main: '#d5d5d5',
                dark: '#000a12',
                contrastText: '#ffffff'
              }
            : {
                light: '#4f5b62',
                main: '#263238',
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

  const classes = useStyles({ isMobile })

  const steps: SectionItem[] = drawerSections.flatMap(
    (section: Section) => section.items
  )

  const allItems: SectionItem[] = [...steps, ...backPages]

  const Layout = ({
    showMenu = true,
    children
  }: PropsWithChildren<{ showMenu?: boolean }>) => (
    <>
      {showMenu ? <Menu /> : undefined}
      <Grid
        component="main"
        tabIndex={-1}
        container
        justifyContent="center"
        direction="row"
      >
        <Grid item sm={12} md={8} lg={6}>
          {showMenu ? (
            <Grid item className={classes.content}>
              {' '}
              <YearStatusBar />
            </Grid>
          ) : undefined}
          <Grid item className={classes.content}>
            {isMobile && showMenu ? (
              <div className={classes.toolbar} />
            ) : undefined}
            {children}
          </Grid>
        </Grid>
      </Grid>
    </>
  )

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SkipToLinks />
      <div className={classes.container}>
        <StateLoader />
        <PagerProvider pages={steps}>
          <Routes>
            <Route path="/" element={<Navigate to={Urls.default} />} />
            {allItems.map((item) => (
              <Route
                key={item.title}
                path={item.url}
                element={
                  <Layout showMenu={!item.url.includes('start')}>
                    <DataPropagator />
                    {item.element}
                  </Layout>
                }
              />
            ))}
            <Route
              path="*"
              element={
                <Layout>
                  <NoMatchPage />
                </Layout>
              }
            />
          </Routes>
        </PagerProvider>
        {!isMobile && <ScrollTop />}
      </div>
    </ThemeProvider>
  )
}
