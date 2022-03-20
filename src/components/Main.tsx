import { Switch, Route, Redirect } from 'react-router-dom'
import { PropsWithChildren, ReactElement } from 'react'
import { CssBaseline, Grid, Theme } from '@mui/material'
import { styled } from '@mui/material/styles'
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

const Prefix = 'Main'

const classes = {
  container: `${Prefix}-container`,
  content: `${Prefix}-content`,
  toolbar: `${Prefix}-toolbar`
}

const Container = styled('div')(
  ({ breakpoints, spacing, mixins, palette: { mode: themeType } }: Theme) => ({
    [`&.${classes.container}`]: {
      flex: 1,
      '& .MuiFormLabel-root': {
        color:
          themeType === 'dark'
            ? 'rgba(255, 255, 255, 0.7)'
            : 'rgba(0, 0, 0, 0.54)'
      }
    },
    [`&.${classes.content}`]: {
      padding: '1em 2em',
      [breakpoints.up('sm')]: {
        borderRadius: '5px',
        boxShadow: 'rgba(0, 0, 0, 0.2) 0px 20px 30px',
        margin: spacing(3),
        padding: '1em 2em'
      },
      width: isMobile ? '100%' : undefined
    },
    [`&.${classes.toolbar}`]: {
      ...mixins.toolbar,
      [breakpoints.up('sm')]: {
        display: 'none'
      }
    }
  })
)

export default function Main(): ReactElement {
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
            {showMenu ? <DataPropagator /> : undefined}
            {children}
          </Grid>
        </Grid>
      </Grid>
    </>
  )

  return (
    <>
      <CssBaseline />
      <SkipToLinks />
      <Container className={classes.container}>
        <StateLoader />
        <PagerProvider pages={steps}>
          <Switch>
            <Redirect path="/" to={Urls.default} exact />
            {allItems.map((item) => (
              <Route key={item.title} exact path={item.url}>
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
        {!isMobile && <ScrollTop />}
      </Container>
    </>
  )
}
