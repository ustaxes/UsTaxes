import * as fc from 'fast-check'
import F1040 from '../../irsForms/F1040'
import Form from 'ustaxes/core/irsForms/Form'
import { create1040 } from '../../irsForms/Main'
import { Information, PersonRole } from 'ustaxes/core/data'
import { createStateReturn } from '../../stateForms'
import { ILWIT } from '../../stateForms/IL/ILWit'
import { isLeft } from 'ustaxes/core/util'
import StateForm from 'ustaxes/core/stateForms/Form'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import { fail } from 'assert'

const withStateReturn = (
  info: Information,
  logContext: fc.ContextValue,
  test: (f1040Forms: [F1040, Form[]], stateForms: StateForm[]) => void
): void => {
  const f1040Result = create1040(info)

  if (isLeft(f1040Result)) {
    // ignore error infos with no 1040
    logContext.log(f1040Result.left.join(';'))
    return
  }

  const [f1040] = f1040Result.right
  const stateReturn = createStateReturn(info, f1040)
  if (isLeft(stateReturn)) {
    fail(stateReturn.left.join(';'))
  }

  test(f1040Result.right, stateReturn.right)
}

const A = new arbitraries.Arbitraries(2020)

describe('il year 2020', () => {
  it('should produce correct withholding attachments in', () => {
    fc.assert(
      fc.property(A.information(), fc.context(), (info, ctx) => {
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
