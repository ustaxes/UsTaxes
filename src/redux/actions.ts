import { W2EmployerInfo, W2EmployeeInfo, W2Info, FamilyInfo } from './data'

export const SAVE_EMPLOYER_DATA = 'SAVE_EMPLOYER_DATA'
export const SAVE_EMPLOYEE_DATA = 'SAVE_EMPLOYEE_DATA'
export const SAVE_FAMILY_INFO = 'SAVE_FAMILY_INFO'
export const SAVE_W2_INFO = 'SAVE_W2_INFO'

interface Save<T, R> {
  type: T
  formData: R
}

type SaveEmployeeData = Save<typeof SAVE_EMPLOYEE_DATA, W2EmployeeInfo>
type SaveEmployerData = Save<typeof SAVE_EMPLOYER_DATA, W2EmployerInfo>
type SaveFamilyInfo = Save<typeof SAVE_FAMILY_INFO, FamilyInfo>
type SaveW2Info = Save<typeof SAVE_W2_INFO, W2Info>

export type Actions = SaveEmployeeData | SaveEmployerData | SaveFamilyInfo | SaveW2Info

export function saveEmployeeData (formData: W2EmployeeInfo): Actions {
  // remove hyphens in SSIDs, Zips etc.. added for readability, removed for PDF filling
  formData.SSID.replace('/-/g', '')

  return {
    type: SAVE_EMPLOYEE_DATA,
    formData
  }
}

export function saveEmployerData (formData: W2EmployerInfo): Actions {
  // remove hyphens in SSIDs, Zips etc.. added for readability, removed for PDF filling
  formData.EIN.replace('/-/g', '')

  return {
    type: SAVE_EMPLOYER_DATA,
    formData
  }
}

export function saveW2Data (formData: W2Info): Actions {
  return {
    type: SAVE_W2_INFO,
    formData
  }
}

export function saveFamilyInfo (formData: FamilyInfo): Actions {
  return {
    type: SAVE_FAMILY_INFO,
    formData
  }
}
