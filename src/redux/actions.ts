import { W2EmployerInfo, W2EmployeeInfo, W2Info, Refund, TaxPayer } from './data'

export const SAVE_EMPLOYER_DATA = 'SAVE_EMPLOYER_DATA'
export const SAVE_EMPLOYEE_DATA = 'SAVE_EMPLOYEE_DATA'
export const SAVE_REFUND_INFO = 'SAVE_REFUND_INFO'
export const SAVE_W2_INFO = 'SAVE_W2_INFO'
export const SAVE_TAXPAYER_INFO = 'SAVE_TAXPAYER_INFO'

interface Save<T, R> {
  type: T
  formData: R
}

type SaveEmployeeData = Save<typeof SAVE_EMPLOYEE_DATA, W2EmployeeInfo>
type SaveEmployerData = Save<typeof SAVE_EMPLOYER_DATA, W2EmployerInfo>
type SaveRefundInfo = Save<typeof SAVE_REFUND_INFO, Refund>
type SaveW2Info = Save<typeof SAVE_W2_INFO, W2Info>
type SaveTaxpayerInfo = Save<typeof SAVE_TAXPAYER_INFO, TaxPayer>

export type Actions = SaveEmployeeData | SaveEmployerData | SaveRefundInfo | SaveW2Info | SaveTaxpayerInfo

export function saveEmployeeData (formData: W2EmployeeInfo): Actions {
  // remove hyphens in SSIDs, Zips etc.. added for readability, removed for PDF filling
  return {
    type: SAVE_EMPLOYEE_DATA,
    formData: {
      ...formData,
      SSID: formData.SSID.replace(/-/g, ''),
      employeeZip: formData.employeeZip.replace(/-/g, '')
    }
  }
}

export function saveEmployerData (formData: W2EmployerInfo): Actions {
  // remove hyphens in SSIDs, Zips etc.. added for readability, removed for PDF filling
  return {
    type: SAVE_EMPLOYER_DATA,
    formData: {
      ...formData,
      EIN: formData.EIN.replace(/-/g, ''),
      employerZip: formData.employerZip.replace(/-/g, '')
    }
  }
}

export function saveW2Data (formData: W2Info): Actions {
  return {
    type: SAVE_W2_INFO,
    formData: {
      ...formData,
      income: formData.income.replace(/\$/g, ''),
      fedWithholding: formData.fedWithholding.replace(/\$/g, '')
    }
  }
}

export function saveRefundInfo (formData: Refund): Actions {
  return {
    type: SAVE_REFUND_INFO,
    formData
  }
}

export function saveTaxpayerInfo (formData: TaxPayer): Actions {
  return {
    type: SAVE_TAXPAYER_INFO,
    formData: {
      ...formData,
      contactPhoneNumber: formData.contactPhoneNumber.replace(/-/g, '')
    }
  }
}
