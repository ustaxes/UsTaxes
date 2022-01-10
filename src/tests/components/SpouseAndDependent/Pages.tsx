import { ReactElement } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import {
  AddDependentForm,
  FilingStatusDropdown,
  SpouseInfo
} from 'ustaxes/components/TaxPayer/SpouseAndDependent'
import YearStatusBar from 'ustaxes/components/YearStatusBar'
import { YearsTaxesState } from 'ustaxes/redux'
import TestPage from 'ustaxes/tests/common/Page'
import YearStatusBarMethods from 'ustaxes/tests/common/YearsStatusBarMethods'
import { DependentMethods, SpouseMethods, FilingStatusMethods } from './Methods'

export class SpouseTestPage extends TestPage {
  spouse: SpouseMethods

  constructor(state: YearsTaxesState) {
    super(state)
    this.spouse = new SpouseMethods(() =>
      this.rendered().getByTestId('spouse-info')
    )
  }

  component: ReactElement = (
    <Router>
      <div data-testid="spouse-info">
        <SpouseInfo />
      </div>
    </Router>
  )
}

export class SpouseAndDependentTestPage extends TestPage {
  yearStatus: YearStatusBarMethods
  spouse: SpouseMethods
  dependent: DependentMethods
  filingStatus: FilingStatusMethods

  constructor(state: YearsTaxesState) {
    super(state)

    const testId = (id: string) => (): HTMLElement =>
      this.rendered().getByTestId(id)

    this.yearStatus = new YearStatusBarMethods(testId('year-status-bar'))
    this.spouse = new SpouseMethods(testId('spouse-info'))
    this.dependent = new DependentMethods(testId('add-dependent-form'))
    this.filingStatus = new FilingStatusMethods(
      testId('filing-status-dropdown')
    )
  }

  component: ReactElement = (
    <Router>
      <div data-testid="year-status-bar">
        <YearStatusBar />
      </div>
      <div data-testid="spouse-info">
        <SpouseInfo />
      </div>
      <div data-testid="add-dependent-form">
        <AddDependentForm />
      </div>
      <div data-testid="filing-status-dropdown">
        <FilingStatusDropdown />
      </div>
    </Router>
  )
}
