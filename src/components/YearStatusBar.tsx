import { Link } from '@material-ui/core'
import { ReactElement, useState } from 'react'
import { useSelector } from 'react-redux'
import { YearsTaxesState } from 'ustaxes/redux'
import { TaxYears } from 'ustaxes/core/data'
import { enumKeys } from 'ustaxes/core/util'
import { toFiniteNumber } from 'ustaxes/core/util'
import { Information } from 'ustaxes/core/data'
import {
  Business,
  SelfEmployedHealthInsuranceWorksheet
} from 'ustaxes/core/data'
import YearDropDown from './YearDropDown'

const YearStatusBar = (): ReactElement => {
  const year = useSelector((state: YearsTaxesState) => state.activeYear)
  const allYears = enumKeys(TaxYears)
  const yearIndex = allYears.indexOf(year)
  const priorYearKey = (() => {
    const priorYearValue = TaxYears[year] - 1
    const key = `Y${priorYearValue}` as typeof year
    if (allYears.includes(key)) {
      return key
    }
    return allYears[yearIndex - 1]
  })()
  const currentYear: Information = useSelector(
    (state: YearsTaxesState) => state[year]
  )
  const priorYear: Information = useSelector(
    (state: YearsTaxesState) => state[priorYearKey]
  )

  const isBlankString = (value?: string): boolean =>
    value === undefined || value.trim() === ''

  const hasBusinessData = (business: Business): boolean => {
    if (
      !isBlankString(business.name) ||
      !isBlankString(business.principalBusinessOrProfession) ||
      !isBlankString(business.businessCode) ||
      !isBlankString(business.ein) ||
      !isBlankString(business.otherExpenseType)
    ) {
      return true
    }
    if (business.address) {
      const address = business.address
      if (
        !isBlankString(address.address) ||
        !isBlankString(address.city) ||
        !isBlankString(address.aptNo) ||
        !isBlankString(address.zip) ||
        !isBlankString(address.foreignCountry) ||
        !isBlankString(address.province) ||
        !isBlankString(address.postalCode) ||
        address.state !== undefined
      ) {
        return true
      }
    }
    const hasNumber = (value?: number): boolean =>
      value !== undefined && value !== 0
    if (
      hasNumber(business.income.grossReceipts) ||
      hasNumber(business.income.returnsAndAllowances) ||
      hasNumber(business.income.otherIncome)
    ) {
      return true
    }
    const expenseValues = Object.values(business.expenses) as Array<
      number | undefined
    >
    if (expenseValues.some((value) => hasNumber(value))) {
      return true
    }
    if (
      hasNumber(business.otherExpenseAmount) ||
      hasNumber(business.homeOfficeDeduction)
    ) {
      return true
    }
    return false
  }

  const hasBusinesses = (info: Information): boolean =>
    (info.businesses ?? []).some(hasBusinessData)

  const hasWorksheetValues = (
    worksheet?: SelfEmployedHealthInsuranceWorksheet
  ): boolean =>
    worksheet !== undefined &&
    Object.values(worksheet).some(
      (value) => toFiniteNumber(value) !== undefined
    )

  const hasAdjustments = (info: Information): boolean => {
    const adjustments = info.adjustments
    if (!adjustments) {
      return false
    }
    return (
      adjustments.alimonyPaid !== undefined ||
      adjustments.alimonyRecipientSsn !== undefined ||
      adjustments.alimonyDivorceDate !== undefined ||
      adjustments.selfEmployedHealthInsuranceDeduction !== undefined ||
      hasWorksheetValues(adjustments.selfEmployedHealthInsuranceWorksheet)
    )
  }

  const debug = [
    `active=${year}`,
    `prior=${priorYearKey}`,
    `currentBusinesses=${String(hasBusinesses(currentYear))}`,
    `priorBusinesses=${String(hasBusinesses(priorYear))}`,
    `currentAdjustments=${String(hasAdjustments(currentYear))}`,
    `priorAdjustments=${String(hasAdjustments(priorYear))}`,
    `currentTaxpayer=${String(
      currentYear.taxPayer.primaryPerson?.firstName !== undefined
    )}`,
    `priorTaxpayer=${String(
      priorYear.taxPayer.primaryPerson?.firstName !== undefined
    )}`
  ].join(' | ')
  const [isOpen, setOpen] = useState(false)

  const openButton = (
    <Link
      href=""
      data-testid="year-dropdown-button"
      onClick={(e) => {
        e.preventDefault()
        setOpen(true)
      }}
    >
      {TaxYears[year]}
    </Link>
  )

  return (
    <div>
      <h3>Editing Information for {isOpen ? TaxYears[year] : openButton}</h3>
      <div style={{ fontSize: '0.85em', opacity: 0.7 }}>{debug}</div>
      {isOpen ? <YearDropDown onDone={() => setOpen(false)} /> : undefined}
    </div>
  )
}

export default YearStatusBar
