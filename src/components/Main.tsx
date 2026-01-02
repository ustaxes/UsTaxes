import { ReactElement } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { isMobileOnly as isMobile } from 'react-device-detect'
import { PagerProvider } from './pager'
import { StateLoader } from './debug'
import NoMatchPage from './NoMatchPage'
import SkipToLinks from './SkipToLinks'
import ScrollTop from './ScrollTop'

import Urls from 'ustaxes/data/urls'
import DataPropagator from './DataPropagator'
import TaxWiseShell from './taxwise/TaxWiseShell'
import { pagerRoutes, taxWiseRoutes, taxWiseSections } from './taxwise/routes'

export default function Main(): ReactElement {
  return (
    <>
      <SkipToLinks />
      <StateLoader />
      <PagerProvider pages={pagerRoutes}>
        <TaxWiseShell sections={taxWiseSections}>
          <DataPropagator />
          <Routes>
            <Route path="/" element={<Navigate to={Urls.app.dashboard} />} />
            {taxWiseRoutes.map((item) => (
              <Route key={item.title} path={item.url} element={item.element} />
            ))}
            <Route path="*" element={<NoMatchPage />} />
          </Routes>
        </TaxWiseShell>
      </PagerProvider>
      {!isMobile && <ScrollTop />}
    </>
  )
}
