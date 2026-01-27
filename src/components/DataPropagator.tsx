import { ReactElement } from 'react'
import { useSelector } from 'react-redux'
import { YearsTaxesState } from 'ustaxes/redux'
import {
  Business,
  Information,
  SelfEmployedHealthInsuranceWorksheet,
  TaxYears
} from 'ustaxes/core/data'
import _ from 'lodash'
import { enumKeys } from 'ustaxes/core/util'
import { useDispatch } from 'ustaxes/redux'
import { setInfo } from 'ustaxes/redux/actions'
import { Button } from '@material-ui/core'
import { Alert } from '@material-ui/lab'

const stripSourceFields = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => stripSourceFields(item))
  }
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const record = value as Record<string, unknown>
    const next = Object.entries(record).reduce<Record<string, unknown>>(
      (acc, [key, val]) => {
        if (key === 'sources') {
          acc[key] = val
          return acc
        }
        if (key.endsWith('_source')) {
          return acc
        }
        acc[key] = stripSourceFields(val)
        return acc
      },
      {}
    )
    return next
  }
  return value
}

const DataPropagator = (): ReactElement => {
  const wholeState = useSelector((state: YearsTaxesState) => state)
  const allYears = enumKeys(TaxYears)
  const yearIndex = _.indexOf(allYears, wholeState.activeYear)
  const priorYearKey = (() => {
    const priorYearValue = TaxYears[wholeState.activeYear] - 1
    const key = `Y${priorYearValue}` as typeof wholeState.activeYear
    if (allYears.includes(key)) {
      return key
    }
    return allYears[yearIndex - 1]
  })()
  const dispatch = useDispatch()

  const currentYear: Information = wholeState[wholeState.activeYear]
  const priorYear: Information = wholeState[priorYearKey]

  const hasWorksheetValues = (
    worksheet?: SelfEmployedHealthInsuranceWorksheet
  ): boolean =>
    worksheet !== undefined &&
    Object.values(worksheet).some((value) => value !== undefined)

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

  const missingTaxPayer =
    currentYear.taxPayer.primaryPerson?.firstName === undefined &&
    priorYear.taxPayer.primaryPerson?.firstName !== undefined
  const missingPrimaryOccupation =
    currentYear.taxPayer.primaryPerson?.occupation === undefined &&
    priorYear.taxPayer.primaryPerson?.occupation !== undefined
  const missingSpouseOccupation =
    currentYear.taxPayer.spouse?.occupation === undefined &&
    priorYear.taxPayer.spouse?.occupation !== undefined
  const priorBusinesses = priorYear.businesses ?? []
  const currentHasBusinesses = hasBusinesses(currentYear)
  const priorHasBusinesses = hasBusinesses(priorYear)
  const missingBusinesses =
    !currentHasBusinesses && (priorHasBusinesses || priorBusinesses.length > 0)
  const missingAdjustments =
    !hasAdjustments(currentYear) && hasAdjustments(priorYear)

  const migratableSections = [
    missingTaxPayer ? 'Taxpayer info' : undefined,
    missingPrimaryOccupation || missingSpouseOccupation
      ? 'Occupation'
      : undefined,
    missingBusinesses ? 'Business details (Schedule C)' : undefined,
    missingAdjustments ? 'Adjustments to income / Form 7206' : undefined
  ].filter((value): value is string => value !== undefined)

  const canPropagate = yearIndex > 0 && migratableSections.length > 0

  const onClick = () => {
    if (canPropagate) {
      const nextSources = { ...(currentYear.sources ?? {}) }
      const nextTaxPayer = missingTaxPayer
        ? priorYear.taxPayer
        : {
            ...currentYear.taxPayer,
            primaryPerson:
              missingPrimaryOccupation &&
              currentYear.taxPayer.primaryPerson &&
              priorYear.taxPayer.primaryPerson
                ? {
                    ...currentYear.taxPayer.primaryPerson,
                    occupation: priorYear.taxPayer.primaryPerson.occupation
                  }
                : currentYear.taxPayer.primaryPerson,
            spouse:
              missingSpouseOccupation &&
              currentYear.taxPayer.spouse &&
              priorYear.taxPayer.spouse
                ? {
                    ...currentYear.taxPayer.spouse,
                    occupation: priorYear.taxPayer.spouse.occupation
                  }
                : currentYear.taxPayer.spouse
          }

      const nextInfo: Information = {
        ...currentYear,
        taxPayer: nextTaxPayer,
        w2s: currentYear.w2s.length === 0 ? priorYear.w2s : currentYear.w2s,
        f1099s:
          currentYear.f1099s.length === 0
            ? priorYear.f1099s
            : currentYear.f1099s,
        f1098s:
          currentYear.f1098s.length === 0
            ? priorYear.f1098s
            : currentYear.f1098s,
        realEstate:
          currentYear.realEstate.length === 0
            ? priorYear.realEstate
            : currentYear.realEstate,
        businesses: missingBusinesses
          ? priorYear.businesses
          : currentYear.businesses,
        adjustments: missingAdjustments
          ? priorYear.adjustments
          : currentYear.adjustments,
        sources: nextSources
      }

      if (missingTaxPayer) {
        nextSources.taxPayer = priorYear.sources?.taxPayer
      } else if (missingPrimaryOccupation || missingSpouseOccupation) {
        nextSources.taxPayer = {
          ...(currentYear.sources?.taxPayer as Record<string, unknown>),
          ...(priorYear.sources?.taxPayer as Record<string, unknown>)
        }
      }
      if (currentYear.w2s.length === 0) {
        nextSources.w2s = priorYear.sources?.w2s
      }
      if (currentYear.f1099s.length === 0) {
        nextSources.f1099s = priorYear.sources?.f1099s
      }
      if (currentYear.f1098s.length === 0) {
        nextSources.f1098s = priorYear.sources?.f1098s
      }
      if (currentYear.realEstate.length === 0) {
        nextSources.realEstate = priorYear.sources?.realEstate
      }
      if (missingBusinesses) {
        nextSources.businesses = priorYear.sources?.businesses
      }
      if (missingAdjustments) {
        nextSources.adjustments = priorYear.sources?.adjustments
      }

      dispatch(setInfo(stripSourceFields(nextInfo) as Information))
    }
  }

  if (canPropagate) {
    return (
      <div>
        <Alert severity="info">
          <p>
            Data from the prior tax year can be migrated into the current year.
            Would you like to copy it over?
          </p>
          <p>Sections to be copied: {migratableSections.join(', ')}</p>
          <Button onClick={onClick} variant="contained" color="primary">
            Migrate
          </Button>
        </Alert>
      </div>
    )
  }
  return <></>
}

export default DataPropagator
