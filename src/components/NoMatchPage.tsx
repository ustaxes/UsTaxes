import React, { ReactElement } from 'react'

import { Link } from 'react-router-dom'

export default function NoMatchPage (): ReactElement {
  return (
    <form>
      <h2>Page not found</h2>
      <p>We can&apos;t find the page you&apos;re looking for! Don&apos;t worry, your progress has been saved</p>
      <p><Link to='/info'>Go back home</Link></p>
    </form>
  )
}
