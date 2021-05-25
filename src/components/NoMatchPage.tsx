import React, { ReactElement } from 'react'

import { Link } from 'react-router-dom'

export default function NoMatchPage (): ReactElement {
  return (
    <form>
      <h2>Error 404: Page not found</h2>
      <h4>We can&apos;t find that page! Don&apos;t worry, your progress has been saved</h4>
      <h4><Link to='/info'>Go back home</Link></h4>
    </form>
  )
}
