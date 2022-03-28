import { createGenerator } from 'ts-json-schema-generator'
import fs from 'fs'
import Ajv from 'ajv'

import standaloneCode from 'ajv/dist/standalone'

const config = {
  path: 'src/core/data/index.ts',
  tsconfig: 'tsconfig.json',
  type: '*' // Or <type-name> if you want to generate schema for that one type only
}

const indexSchema = {
  $id: '#/definitions/index',
  type: 'number',
  minimum: 0
}

const outputPath = 'src/core/data/validate-fns.js'

const schema = createGenerator(config).createSchema(config.type)

const ajv = new Ajv({
  schemas: [schema, indexSchema],
  allowUnionTypes: true,
  code: { source: true, esm: true }
})

const moduleCode = standaloneCode(ajv, {
  Index: '#/definitions/index',
  PersonRole: '#/definitions/PersonRole',
  ContactInfo: '#/definitions/ContactInfo',
  Address: '#/definitions/Address',
  AccountType: '#/definitions/AccountType',
  Employer: '#/definitions/Employer',
  FilingStatus: '#/definitions/FilingStatus',
  PrimaryPerson: '#/definitions/PrimaryPerson',
  Spouse: '#/definitions/Spouse',
  Person: '#/definitions/Person',
  Dependent: '#/definitions/Dependent',
  F1099IntData: '#/definitions/F1099IntData',
  F1099BData: '#/definitions/F1099BData',
  Income1099Int: '#/definitions/Income1099Int',
  Income1099B: '#/definitions/Income1099B',
  Supported1099: '#/definitions/Supported1099',
  IncomeW2: '#/definitions/IncomeW2',
  EstimatedTaxPayments: '#/definitions/EstimatedTaxPayments',
  Refund: '#/definitions/Refund',
  TaxPayer: '#/definitions/TaxPayer',
  Information: '#/definitions/Information',
  Property: '#/definitions/Property',
  PropertyType: '#/definitions/PropertyType',
  F1098e: '#/definitions/F1098e',
  ItemizedDeductions: '#/definitions/ItemizedDeductions',
  Responses: '#/definitions/Responses',
  StateResidency: '#/definitions/StateResidency',
  HealthSavingsAccount: '#/definitions/HealthSavingsAccount',
  Ira: '#/definitions/Ira',
  AssetType: '#/definitions/AssetType',
  AssetString: '#/definitions/AssetString',
  TaxYear: '#/definitions/TaxYear',

  EditHSAAction: '#/definitions/EditHSAAction',
  EditIRAAction: '#/definitions/EditIraAction'
})

fs.writeFileSync(outputPath, moduleCode)
