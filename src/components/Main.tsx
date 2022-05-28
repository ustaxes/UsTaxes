import { PropsWithChildren, ReactElement } from 'react'
import {
  createStyles,
  makeStyles,
  CssBaseline,
  Grid,
  Theme
} from '@material-ui/core'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isMobileOnly as isMobile } from 'react-device-detect'
import { PagerProvider } from './pager'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'
import SkipToLinks from './SkipToLinks'
import ScrollTop from './ScrollTop'
import Menu, { backPages, drawerSectionsForYear } from './Menu'
import { Section, SectionItem } from './ResponsiveDrawer'

import Urls from 'ustaxes/data/urls'
import DataPropagator from './DataPropagator'
import YearStatusBar from './YearStatusBar'
import { useSelector } from 'react-redux'
import { TaxYear } from 'ustaxes/core/data'
import { YearsTaxesState } from 'ustaxes/redux'

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
  const activeYear: TaxYear = useSelector(
    (state: YearsTaxesState) => state.activeYear
  )

  const classes = useStyles({ isMobile })

  const steps: SectionItem[] = drawerSectionsForYear(activeYear).flatMap(
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
    <>
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
    </>
  )
}
