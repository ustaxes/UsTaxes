import { createGenerator } from 'ts-json-schema-generator'
import fs from 'fs'

const config = {
  path: 'src/redux/data.ts',
  tsconfig: 'tsconfig.json',
  type: '*' // Or <type-name> if you want to generate schema for that one type only
}

const outputPath = 'src/redux/validation.json'

const schema = createGenerator(config).createSchema(config.type)
const schemaString = JSON.stringify(schema, null, 2)
fs.writeFile(outputPath, schemaString, (err): void => {
  if (err) throw err
})
