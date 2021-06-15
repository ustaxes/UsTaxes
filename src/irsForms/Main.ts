import { Income1099Type, Information } from '../redux/data'
import { Either, left, right } from '../util'
import F1040, { F1040Error } from './F1040'
import F1040V from './F1040v'
import Form from './Form'
import Schedule1 from './Schedule1'
import ScheduleB from './ScheduleB'
import ScheduleD from './ScheduleD'
import ScheduleE from './ScheduleE'
import ScheduleEIC from './ScheduleEIC'
import StudentLoanInterestWorksheet from './worksheets/StudentLoanInterestWorksheet'

export const getSchedules = (f1040: F1040, state: Information): Form[] => {
  let attachments: Form[] = []
  const prepends: Form[] = []

  if (state.f1099s.find((v) => v.type === Income1099Type.INT) !== undefined) {
    const schB = new ScheduleB(state)
    f1040.addScheduleB(schB)
    attachments = [...attachments, schB]
  }

  if (state.f1099s.find((v) => v.type === Income1099Type.B) !== undefined) {
    const schD = new ScheduleD(state)
    f1040.addScheduleD(schD)
    attachments = [...attachments, schD]
  }

  if (state.realEstate.length > 0) {
    const se = new ScheduleE(state)
    f1040.addScheduleE(se)
    attachments = [...attachments, se]
  }

  if (state.f1098es.length > 0) {
    const studentLoanInterestWorksheet = new StudentLoanInterestWorksheet(f1040, state.taxPayer, state.f1098es)
    f1040.addStudentLoanInterestWorksheet(studentLoanInterestWorksheet)
    // Future proofing be checking if Schedule 1 exists before adding it
    // Don't add s1 if unable to take deduction
    if (f1040.schedule1 === undefined && studentLoanInterestWorksheet.notMFS() && studentLoanInterestWorksheet.isNotDependent()) {
      const s1 = new Schedule1(state, f1040)
      f1040.addSchedule1(s1)
      attachments = [s1, ...attachments]
    }
  }

  if (f1040.scheduleE !== undefined) {
    if (f1040.schedule1 === undefined) {
      const s1 = new Schedule1(state, f1040)
      f1040.addSchedule1(s1)
      s1.addScheduleE(f1040.scheduleE)
      attachments = [s1, ...attachments]
    } else {
      f1040.schedule1.addScheduleE(f1040.scheduleE)
    }
  }

  const eic = new ScheduleEIC(state.taxPayer, f1040)
  if (eic.allowed(f1040)) {
    f1040.addScheduleEIC(eic)
    attachments = [...attachments, eic]
  }

  // Attach payment voucher to front if there is a payment due
  if ((f1040.l37() ?? 0) > 0) {
    const f1040v = new F1040V(state, f1040)
    prepends.push(f1040v)
  }

  return [...prepends, f1040, ...attachments]
}

export function create1040 (state: Information): Either<F1040Error[], [F1040, Form[]]> {
  const f1040 = new F1040(state.taxPayer)

  state.w2s.forEach((w2) => f1040.addW2(w2))

  f1040.addQuestions(state.questions)

  if (state.refund !== undefined) {
    f1040.addRefund(state.refund)
  }

  if (f1040.errors().length > 0) {
    return left(f1040.errors())
  }

  return right([f1040, getSchedules(f1040, state)])
}
