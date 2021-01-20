export interface W2EmployeeInfo {
  SSID: string
  employeeFirstName: string
  employeeLastName: string
  employeeAddress: string
  employeeCity: string
  employeeState: string
  employeeZip: string
  employeeProvince?: string
  employeePostalCode?: string
}

export interface W2EmployerInfo {
  EIN: string
  employerName: string
  employerAddress: string
  employerCity: string
  employerState: string
  employerZip: string
  employerProvince?: string
  employerCountry?: string
  employerPostalCode?: string
}

export interface Refund {
  routingNumber: string
  accountNumber: string
}

export interface W2Info {
  occupation: string
  income: string
  fedWithholding: string
}

export interface TaxPayer {
  contactPhoneNumber: string
  contactEmail: string
}

export interface Information {
  w2EmployeeInfo?: W2EmployeeInfo
  w2EmployerInfo?: W2EmployerInfo
  w2Info?: W2Info
  refund?: Refund
  taxpayer?: TaxPayer
}

export interface TaxesState {
  information: Information
}
