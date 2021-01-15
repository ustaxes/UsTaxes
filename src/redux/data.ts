export interface W2EmployeeInfo {
  SSID: string
  employeeFirstName: string
  employeeLastName: string
  employeeAddress: string
  employeeCity: string
  employeeState: string
  employeeZip: string
  employeeProvince: string | undefined
  employeePostalCode: string | undefined
}

export interface W2EmployerInfo {
  EIN: string
  employerName: string
  employerAddress: string
  employerCity: string
  employerState: string
  employerZip: string
  employerProvince: string | undefined
  employerCountry: string | undefined
  employerPostalCode: string | undefined
}

export interface FamilyInfo {
  routingNumber: string
  accountNumber: string
  contactPhoneNumber: string
  contactEmail: string
}

export interface W2Info {
  occupation: string
  income: string
  fedWithholding: string
}

export interface Information {
  w2EmployeeInfo?: W2EmployeeInfo
  w2EmployerInfo?: W2EmployerInfo
  w2Info?: W2Info
  familyInfo?: FamilyInfo
}

export interface TaxesState {
  information: Information
}
