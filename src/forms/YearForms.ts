import { Information, State } from 'ustaxes-core/data'
import { Either } from 'ustaxes-core/util'
import { TaxYear } from 'ustaxes/data'
import {create1040 as create1040For2020} from 'ustaxes-forms-2020/irsForms/Main'
import {create1040 as create1040For2021} from 'ustaxes-forms-2021/irsForms/Main'

import F1040For2020, {F1040Error as F1040ErrorFor2020 } from 'ustaxes-forms-2020/irsForms/F1040'
import F1040For2021, {F1040Error as F1040ErrorFor2021 } from 'ustaxes-forms-2021/irsForms/F1040'

import Form from 'ustaxes-core/irsForms/Form'
import StateForm from 'ustaxes-core/stateForms/Form'

import { stateForm as stateForm2020, createStateReturn as createStateReturn2020 } from 'ustaxes-forms-2020/stateForms'
import { stateForm as stateForm2021, createStateReturn as createStateReturn2021 } from 'ustaxes-forms-2021/stateForms'

// Create types linking one year to one 1040 type.
interface YearTag<Y, A> {
  readonly year: Y
  data: A
}

type Year2019 = YearTag<'Y2019', undefined> 
const year2019 = (data: undefined): Year2019 => ({ year: 'Y2019', data })

type Year2020 = YearTag<'Y2020', F1040For2020>
const year2020 = (data: F1040For2020): Year2020 => ({ year: 'Y2020', data })

type Year2021 = YearTag<'Y2021', F1040For2021>
const year2021 = (data: F1040For2021): Year2021 => ({ year: 'Y2021', data })

type YearForm = Year2019 | Year2020 | Year2021
// Year types done

type F1040For2019 = undefined

type F1040 = F1040For2019 | F1040For2020 | F1040For2021

type F1040Error = F1040ErrorFor2020 | F1040ErrorFor2021

type Create1040Return<E, F> = Either<E[], [F, Form[]]>

type YearCreate1040 = Create1040Return<F1040Error, F1040>

export const create1040 = (year: TaxYear): ((info: Information) => YearCreate1040) => {
  if (year === 'Y2020') {
    return (info: Information): YearCreate1040 => create1040For2020(info)
  } else if(year === 'Y2021') {
    return (info: Information): YearCreate1040 => create1040For2021(info)
  } else {
    throw new Error('Unsupported year')
  }
}

export const canCreateFederalReturn = (year: TaxYear): boolean => {
  return create1040(year) !== undefined
}

export const yearFormInfer = (year: TaxYear, f1040: F1040): YearForm => {
  switch (year) {
    case 'Y2019':
      return year2019(f1040 as F1040For2019)
    case 'Y2020':
      return year2020(f1040 as F1040For2020)
    case 'Y2021':
      return year2021(f1040 as F1040For2021)
  }
}
// -- end of year types 


export const makeStateReturn = (state: Information, yearForm: YearForm): StateForm[] | undefined => {
  if (yearForm.year === 'Y2020') {
    return createStateReturn2020(state, yearForm.data)
  } else if (yearForm.year === 'Y2021') {
    return createStateReturn2021(state, yearForm.data)
  }
}

export const canCreateStateReturn = (year: TaxYear, state: State): boolean => {
  if (year === 'Y2020') {
    return stateForm2020[state] !== undefined
  } else if (year === 'Y2021') {
    return stateForm2021[state] !== undefined    
  }
  return false
}
