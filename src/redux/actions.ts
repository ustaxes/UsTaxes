import { W2EmployerInfo, W2Information, FamilyInfo } from './data'

export const SAVE_EMPLOYER_DATA = 'SAVE_EMPLOYER_DATA'
export const SAVE_EMPLOYEE_DATA = 'SAVE_EMPLOYEE_DATA'
export const SAVE_FAMILY_INFO = 'SAVE_FAMILY_INFO'

interface SaveEmployeeData {
  type: typeof SAVE_EMPLOYEE_DATA
  formData: W2Information
}

interface SaveEmployerData {
  type: typeof SAVE_EMPLOYER_DATA
  formData: W2EmployerInfo
}

interface SaveFamilyInfo {
  type: typeof SAVE_FAMILY_INFO
  formData: FamilyInfo
}

export type Actions = SaveEmployeeData | SaveEmployerData | SaveFamilyInfo

export function saveEmployeeData (formData: W2Information): Actions {
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

export function saveFamilyInfo (formData: FamilyInfo): Actions {
  return {
    type: SAVE_FAMILY_INFO,
    formData
  }
}
