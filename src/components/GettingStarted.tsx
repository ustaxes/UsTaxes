import React, { ReactElement } from 'react'
import { DirectButtons } from './pager'

export default function GettingStarted (): ReactElement {
  return (
        <form>
          <h2>Getting Started</h2>
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
          </ul>

          <p>Supported Attachments to Form 1040</p>
          <ul>
            <li>Schedule 1 (as related to Schedule E only)</li>
            <li>Schedule B</li>
            <li>Schedule D</li>
            <li>Schedule E</li>
          </ul>

          <p>Supported Credits</p>
          <ul>
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

        { <DirectButtons
          submitText={ 'Start Return' }
          targetUrl={ '/info' }
          /> }
        </form>
  )
}
