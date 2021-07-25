import React, { ReactElement } from 'react'
import { StartButtons, SingleButtons } from './pager'

const repoUrl: string = 'https://github.com/ustaxes/UsTaxes'
const codeOfConductUrl: string = 'https://github.com/ustaxes/UsTaxes/blob/master/docs/CODE_OF_CONDUCT.md'
const contributingUrl: string = 'https://github.com/ustaxes/UsTaxes/blob/master/docs/CONTRIBUTING.md'
const architecture: string = 'https://github.com/ustaxes/UsTaxes/blob/master/docs/ARCHITECTURE.md'
const releases: string = 'https://github.com/ustaxes/UsTaxes/releases'

const doubleButtons: ReactElement = <StartButtons firstText={ 'Start Return In Browser' } firstUrl ={ '/info' } secondText={ 'Download Desktop Version' } secondUrl={ releases } />
const singleButtons: ReactElement = <SingleButtons text={ 'Start Return' } url={ '/info' } />

export default function GettingStarted (): ReactElement {
  return (
        <form>
          <h1>UsTaxes.org</h1>
          <p>
          UsTaxes is an open source tax filing application that can be used to file the Form 1040 United States individual income tax return.
          Unlike paid tax preparation software, UsTaxes both protects user privacy and is provided free of charge.
          </p>
          <p>
          Interested in using UsTaxes? The income forms, return attachments, credits, and states of residency are provided below.
          </p>

          <p>Supported Income Forms</p>
          <ul>
            <li>W2</li>
            <li>1099-INT</li>
            <li>1099-DIV</li>
            <li>1099-B</li>
            <li>1098-E</li>
          </ul>

          <p>Supported Attachments to Form 1040</p>
          <ul>
            <li>Schedule 1 (as related to Schedule E only)</li>
            <li>Schedule 3 (as related to excess FICA only)</li>
            <li>Schedule 8812</li>
            <li>Schedule B</li>
            <li>Schedule D</li>
            <li>Schedule E</li>
          </ul>

          <p>Supported Credits</p>
          <ul>
            <li>Credit for children and other dependents</li>
            <li>Earned Income Tax Credit</li>
          </ul>

          <p>Supported States</p>
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

        <p>If your types of income and state residency are supported, you should be able to use UsTaxes to paper file your return!</p>

        { ((window as any).__TAURI__ === undefined) ? doubleButtons : singleButtons }

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
