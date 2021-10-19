import * as fc from 'fast-check'
import F1040 from 'ustaxes/irsForms/F1040'
import Form from 'ustaxes/irsForms/Form'
import { create1040 } from 'ustaxes/irsForms/Main'
import { Information, PersonRole } from 'ustaxes/redux/data'
import { createStateReturn } from 'ustaxes/stateForms'
import { ILWIT } from 'ustaxes/stateForms/IL/ILWit'
import { isLeft } from 'ustaxes/util'
import StateForm from 'ustaxes/stateForms/Form'
import * as arbitraries from '../arbitraries'

const withStateReturn = (
  info: Information,
  logContext: fc.ContextValue,
  test: (f1040Forms: [F1040, Form[]], stateForms: StateForm[]) => void
): void => {
  const f1040Result = create1040(info)

  if (isLeft(f1040Result)) {
    logContext.log(f1040Result.left.join(';'))
    fail('error creating 1040')
  }

  const [f1040] = f1040Result.right
  const stateReturn = createStateReturn(info, f1040, 'Y2020')
  if (stateReturn === undefined) {
    fail('IL Return creation failed')
  }

  test(f1040Result.right, stateReturn)
}

describe('il year 2020', () => {
  it('should produce correct withholding attachments in', () => {
    fc.assert(
      fc.property(arbitraries.information, fc.context(), (info, ctx) => {
        info.stateResidencies = [{ state: 'IL' }]
        info.w2s.forEach((w2) => {
          w2.state = 'IL'
        })
        withStateReturn(info, ctx, (_, stateForms) => {
          ctx.log(stateForms.map((f) => f.formName).join(';'))
          expect(stateForms.filter((f) => f.formName === 'IL-WIT').length).toBe(
            Math.ceil(
              Math.max(
                ...[PersonRole.PRIMARY, PersonRole.SPOUSE].map(
                  (r) =>
                    info.w2s.filter(
                      (w2) =>
                        w2.personRole === r && (w2.stateWithholding ?? 0) > 0
                    ).length
                )
              ) / ILWIT.WITHHOLDING_FORMS_PER_PAGE
            )
          )
        })
      })
    )
  })
})
