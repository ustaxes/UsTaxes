export interface W2Information {
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

export interface Information {
  w2EmployeeInfo: W2Information
  w2EmployerInfo: W2EmployerInfo
  familyInfo: FamilyInfo
}

export interface TaxesState {
  information: Information
}
