import React, { ReactElement } from 'react'

import { Link } from 'react-router-dom'

export default function NoMatchPage (): ReactElement {
  return (
    <form>
      <h2>Page not found</h2>
      <h4>We can&apos;t find the page you&apos;re looking for! Don&apos;t worry, your progress has been saved</h4>
      <h4><Link to='/info'>Go back home</Link></h4>
    </form>
  )
}
