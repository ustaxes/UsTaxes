import { Switch, Route, Redirect, useLocation } from 'react-router-dom'
import { PropsWithChildren, ReactElement } from 'react'
import { CssBaseline, Grid, Theme } from '@mui/material'
import { createStyles, makeStyles } from '@mui/styles'
import { isMobileOnly as isMobile } from 'react-device-detect'
import { PagerProvider } from './pager'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'
import SkipToLinks from './SkipToLinks'
import ScrollTop from './ScrollTop'
import Menu, { drawerSections, backPages } from './Menu'
import { Section, SectionItem } from './ResponsiveDrawer'

import { useFocus } from 'ustaxes/hooks/Focus'
import Urls from 'ustaxes/data/urls'
import DataPropagator from './DataPropagator'
import YearStatusBar from './YearStatusBar'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      display: 'flex'
    },
    content: {
      padding: '1em 2em',
      [theme.breakpoints.up('sm')]: {
        borderRadius: '5px',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 20px 30px',
        margin: theme.spacing(3),
        padding: '1em 2em'
      },
      width: isMobile ? '100%' : undefined
    },
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
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SkipToLinks />
        {isMobile && !isStartPage && <div className={classes.toolbar} />}
        <div className={classes.container}>
          <StateLoader />
          <PagerProvider pages={steps}>
            <Switch>
              <Redirect path="/" to={Urls.default} exact />
              {allItems.map((item) => (
                <Route key={item.title} exact path={item.url}>
                  {!isStartPage && <Menu />}
                  <Layout>
                    {!isStartPage && <DataPropagator />}
                    {item.element}
                  </Layout>
                </Route>
              ))}
              <Route>
                <Layout>
                  <NoMatchPage />
                </Layout>
              </Route>
            </Switch>
          </PagerProvider>
          {!isMobile && <ScrollTop />}
        </div>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
