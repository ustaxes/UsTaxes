import { ReactElement } from 'react'
import { Link, useMediaQuery } from '@material-ui/core'
import { StartButtons, SingleButtons } from './pager'
import { isWeb } from 'ustaxes/util'

const urls = {
  repo: 'https://github.com/ustaxes/UsTaxes',
  releases: 'https://github.com/ustaxes/UsTaxes/releases',
  issues: 'https://github.com/ustaxes/ustaxes/issues',
  twitter: 'https://twitter.com/ustaxesorg',
  discord: 'https://discord.gg/xm5HmqX6',
  aidan: 'https://github.com/aidangrimshaw',
  zak: 'https://github.com/zakpatterson',
  startPage: '/info'
}

const doubleButtons: ReactElement = (
  <StartButtons
    firstText={'Start Return In Browser'}
    firstUrl={urls.startPage}
    secondText={'Download Desktop Version'}
    secondUrl={urls.releases}
  />
)
const singleButtons: ReactElement = (
  <SingleButtons text={'Start Return'} url={urls.startPage} />
)

export default function GettingStarted(): ReactElement {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  return (
    <>
      <h1>UsTaxes.org</h1>
      <p>
        UsTaxes is an open source tax filing application that can be used to
        file the Form 1040 United States individual income tax return and some
        state individual income tax returns. UsTaxes is provided free of charge
        and requires no sharing of personal data.
      </p>
      <p>
        Interested in using UsTaxes? The income forms, return attachments,
        credits, and states of residency are provided below.
      </p>
      <h2>Federal Filing Support</h2>
      <h3>Supported Income Forms</h3>
      The following income forms are (mostly) supported:
      <ul>
        <li>W2</li>
        <li>1099-INT</li>
        <li>1099-DIV</li>
        <li>1099-B</li>
        <li>1098-E</li>
        <li>
          1099-R: support for normal distributions from IRA and pension
          accounts.
        </li>
        <li>SSA-1099</li>
      </ul>
      <h3>Supported Attachments to Form 1040</h3>
      USTaxes can attach the following to your 1040:
      <ul>
        <li>Schedule 1 (as related to Schedule E only)</li>
        <li>Schedule 3 (as related to excess FICA only)</li>
        <li>Schedule 8812</li>
        <li>Schedule B</li>
        <li>Schedule D</li>
        <li>Schedule E</li>
        <li>F1040-V</li>
      </ul>
      <h3>Supported Credits</h3>
      These federal income tax credits are supported:
      <ul>
        <li>Credit for Children and Other Dependents</li>
        <li>Earned Income Tax Credit</li>
      </ul>
      <h2>State Income Tax</h2>
      <p>State tax returns are now in development.</p>
      <p>The following states are currently implemented:</p>
      <ul>
        <li>Illinois</li>
      </ul>
      Note the following states have no income tax filing:
      <ul>
        <li>Alaska</li>
        <li>Tennessee</li>
        <li>Wyoming</li>
        <li>Florida</li>
        <li>New Hampshire</li>
        <li>South Dakota</li>
        <li>Texas</li>
        <li>Washington</li>
        <li>Nevada</li>
      </ul>
      <p>
        <strong>10</strong>/51 states are supported. If your types of income and
        state residency are supported, you should be able to use UsTaxes to
        paper file your return!
      </p>
      <p>
        The success of this project depends on user feedback. If you notice any
        issues at all with the project, please reach out to us!
      </p>
      <ul>
        <li>
          File an issue: <Link href={urls.issues}>GitHub Issues</Link>
        </li>
        <li>
          Message us on <Link href={urls.twitter}>Twitter</Link>
        </li>
        <li>
          Think you have something to contribute? Come to our{' '}
          <Link href={urls.discord}>Discord channel</Link>.
        </li>
      </ul>
      {isWeb() ? doubleButtons : singleButtons}
      <h2>About This Project</h2>
      <p>
        UsTaxes is an open source project maintained by{' '}
        <Link href={urls.aidan}>Aidan Grimshaw</Link> and{' '}
        <Link href={urls.zak}>Zak Patterson</Link>.
      </p>
      <p>
        Contributions to the <Link href={urls.repo}>GitHub</Link> repository are
        welcome.
      </p>
      {prefersDarkMode ? (
        <a href="https://www.netlify.com">
          <img src="netlify-dark.svg" alt="Deploys by Netlify" />
        </a>
      ) : (
        <a href="https://www.netlify.com">
          <img src="netlify-light.svg" alt="Deploys by Netlify" />
        </a>
      )}
    </>
  )
}
