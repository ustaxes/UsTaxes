import { createStore, applyMiddleware } from 'redux'
import logger from 'redux-logger'
import rootReducer from './reducer'

import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import { FamilyInfo, W2EmployerInfo, W2Information, Information, TaxesState } from './data'

export function initialW2Info (): W2Information {
  return {
    SSID: '',
    employeeFirstName: '',
    employeeLastName: '',
    employeeAddress: '',
    employeeCity: '',
    employeeState: '',
    employeeZip: '',
    employeePostalCode: '',
    employeeProvince: ''
  }
}

function initialEmployerInfo (): W2EmployerInfo {
  return {
    EIN: '',
    employerName: '',
    employerAddress: '',
    employerCity: '',
    employerState: '',
    employerZip: '',
    employerProvince: '',
    employerCountry: '',
    employerPostalCode: ''
  }
}

function initialFamilyInfo (): FamilyInfo {
  return {
    routingNumber: '',
    accountNumber: '',
    contactPhoneNumber: '',
    contactEmail: ''
  }
}

export function initialInformation (): Information {
  return {
    w2EmployeeInfo: initialW2Info(),
    w2EmployerInfo: initialEmployerInfo(),
    familyInfo: initialFamilyInfo()
  }
}

export function initialTaxesState (): TaxesState {
  return {
    information: initialInformation()
  }
}

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer)

export const store = createStore(
  persistedReducer,
  applyMiddleware(logger)
)

export const persistor = persistStore(store)
