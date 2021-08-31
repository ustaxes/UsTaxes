import { ReactElement } from 'react'
import { SingleButtons } from './pager'

export default function NoMatchPage(): ReactElement {
  return (
    <form>
      <h2>Page not found</h2>
      <p>
        We can&apos;t find the page you&apos;re looking for! Don&apos;t worry,
        your progress has been saved
      </p>
      <SingleButtons text={'Go Back Home'} url={'/'} />
    </form>
  )
}
