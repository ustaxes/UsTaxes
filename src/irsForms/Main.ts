import { Income1099Type, Information } from '../redux/data'
import F1040 from './F1040'
import Form from './Form'
import ScheduleB from './ScheduleB'
import ScheduleD from './ScheduleD'
import ScheduleEIC from './ScheduleEIC'

function getSchedules (state: Information, f1040: F1040): Form[] {
  let attachments: Form[] = []

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

  const schEic = new ScheduleEIC(state.taxPayer)
  attachments = [...attachments, schEic]
  f1040.addScheduleEIC(schEic)

  return attachments
}

export function create1040 (state: Information): F1040 {
  const f1040 = new F1040(state.taxPayer)
  state.w2s.forEach((w2) => f1040.addW2(w2))
  if (state.refund !== undefined) {
    f1040.addRefund(state.refund)
  }

  getSchedules(state, f1040)

  return f1040
}
