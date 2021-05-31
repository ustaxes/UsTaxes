import React, { ReactElement } from 'react'

export default function AboutThisProject (): ReactElement {
  const repoUrl: string = 'https://github.com/ustaxes/UsTaxes'
  const codeOfConductUrl: string = 'https://github.com/ustaxes/UsTaxes/blob/master/docs/CODE_OF_CONDUCT.md'
  const contributingUrl: string = 'https://github.com/ustaxes/UsTaxes/blob/master/docs/CONTRIBUTING.md'
  const architecture: string = 'https://github.com/ustaxes/UsTaxes/blob/master/docs/ARCHITECTURE.md'
  return (
        <form>
          <h2>About This Project</h2>
          <p>
            UsTaxes is an open source project maintained by Aidan Grimshaw and Zak Patterson, and outside contributions to the
            <a href={repoUrl}> GitHub</a> repository are welcome. Please review the
            <a href={codeOfConductUrl}> Code of Conduct</a>, <a href={contributingUrl}>Contributing Guide</a>
            , and <a href={architecture}>Project Architecture</a> documents before making any contributions. For those that would like to financially support the project we, unfortunately,
            do not have a mechanism to receive donations at this time.
          </p>
        </form>
  )
}
