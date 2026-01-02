import { StateModule } from './types'

const OhioModule: StateModule = {
  id: 'OH',
  name: 'Ohio',
  eligibilityQuestions: () => [
    'Did the taxpayer have Ohio residency during the tax year?',
    'Did the taxpayer earn income in another state?'
  ],
  compute: () => ({
    stateTotals: {},
    diagnostics: [
      {
        id: 'ohio-not-implemented',
        level: 'info',
        message: 'Ohio state return is not implemented yet.',
        section: 'State'
      }
    ]
  }),
  toPdfPayload: () => ({}),
  diagnostics: () => [
    {
      id: 'ohio-not-implemented',
      level: 'info',
      message: 'Ohio state return is not implemented yet.',
      section: 'State'
    }
  ]
}

export default OhioModule
