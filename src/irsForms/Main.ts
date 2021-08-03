import { Income1099Type, Income1099R, Information } from '../redux/data'
import { Either, left, right } from '../util'
import F1040, { F1040Error } from './F1040'
import F1040V from './F1040v'
import F8959, { needsF8959 } from './F8959'
import Form from './Form'
import Schedule1 from './Schedule1'
import Schedule3, { claimableExcessSSTaxWithholding } from './Schedule3'
import ScheduleB from './ScheduleB'
import ScheduleD from './ScheduleD'
import ScheduleE from './ScheduleE'
import ScheduleEIC from './ScheduleEIC'
import Schedule8812 from './Schedule8812'
import ChildTaxCreditWorksheet from './worksheets/ChildTaxCreditWorksheet'
import StudentLoanInterestWorksheet from './worksheets/StudentLoanInterestWorksheet'
import Schedule2 from './Schedule2'

export const getSchedules = (f1040: F1040, state: Information): Form[] => {
  const forms: Form[] = [f1040]

  if (state.f1099s.find((v) => v.type === Income1099Type.INT) !== undefined) {
    const schB = new ScheduleB(state)
    f1040.addScheduleB(schB)
    forms.push(schB)
  }

  if (state.f1099s.find((v) => v.type === Income1099Type.B) !== undefined) {
    const schD = new ScheduleD(state)
    f1040.addScheduleD(schD)
    forms.push(schD)
  }

  if (state.realEstate.length > 0) {
    const se = new ScheduleE(state)
    f1040.addScheduleE(se)
    forms.push(se)
  }

  if (state.f1098es.length > 0) {
    const studentLoanInterestWorksheet = new StudentLoanInterestWorksheet(
      f1040,
      state.taxPayer,
      state.f1098es
    )
    f1040.addStudentLoanInterestWorksheet(studentLoanInterestWorksheet)
    // Future proofing be checking if Schedule 1 exists before adding it
    // Don't add s1 if unable to take deduction
    if (
      f1040.schedule1 === undefined &&
      studentLoanInterestWorksheet.notMFS() &&
      studentLoanInterestWorksheet.isNotDependent()
    ) {
      const s1 = new Schedule1(state, f1040)
      f1040.addSchedule1(s1)
      forms.push(s1)
    }
  }

  if (needsF8959(state)) {
    const f8959 =
      f1040.f8959 !== undefined
        ? f1040.f8959
        : new F8959(state, undefined, undefined, undefined)
    f1040.add8959(f8959)

    const s2 =
      f1040.schedule2 !== undefined
        ? f1040.schedule2
        : new Schedule2(state.taxPayer, f8959)
    f1040.addSchedule2(s2)
    forms.push(s2)
    forms.push(f8959)
  }

  if (
    claimableExcessSSTaxWithholding(state.w2s) > 0 &&
    f1040.schedule3 === undefined
  ) {
    const s3 = new Schedule3(state, f1040)
    f1040.addSchedule3(s3)
    forms.push(s3)
  }

  if (f1040.scheduleE !== undefined) {
    if (f1040.schedule1 === undefined) {
      const s1 = new Schedule1(state, f1040)
      f1040.addSchedule1(s1)
      s1.addScheduleE(f1040.scheduleE)
      forms.push(s1)
    } else {
      f1040.schedule1.addScheduleE(f1040.scheduleE)
    }
  }

  const eic = new ScheduleEIC(state.taxPayer, f1040)
  if (eic.allowed(f1040)) {
    f1040.addScheduleEIC(eic)
    forms.push(eic)
  }

  const ws = new ChildTaxCreditWorksheet(f1040)
  const schedule8812 = new Schedule8812(state.taxPayer, f1040)

  if (
    f1040.dependents.some(
      (dep) => ws.qualifiesChild(dep) || ws.qualifiesOther(dep)
    )
  ) {
    f1040.addChildTaxCreditWorksheet(ws)
    f1040.addSchedule8812(schedule8812)
    forms.push(schedule8812)
  }

  // Attach payment voucher to front if there is a payment due
  if ((f1040.l37() ?? 0) > 0) {
    forms.push(new F1040V(state, f1040))
  }

  forms.sort((a, b) => a.sequenceIndex - b.sequenceIndex)

  return forms
}

export function create1040(
  state: Information
): Either<F1040Error[], [F1040, Form[]]> {
  const f1040 = new F1040(state.taxPayer)

  state.w2s.forEach((w2) => f1040.addW2(w2))

  state.f1099s
    .filter((f) => f.type === Income1099Type.R)
    .map((f) => f as Income1099R)
    .forEach(element => {
      f1040.add1099R(element)
    })

  f1040.addQuestions(state.questions)

  if (state.refund !== undefined) {
    f1040.addRefund(state.refund)
  }

  if (f1040.errors().length > 0) {
    return left(f1040.errors())
  }

  return right([f1040, getSchedules(f1040, state)])
}
