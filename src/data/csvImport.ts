import { parse } from 'csv-parse/lib'

export type DateFormat =
  | 'YYYY-MM-DD'
  | 'DD-MM-YYYY'
  | 'MM-DD-YYYY'
  | 'DD-MM-YY'
  | 'MM-DD-YY'
  | 'YY-MM-DD'

export interface CsvConfig<K> {
  delimiter: string
  quote: string
  escape: string
  fields: Map<K, number>
  dateFormat: string
}

export const preflightCsvAll = (contents: string): Promise<string[][]> =>
  new Promise((resolve, reject) => {
    const parser = parse({ delimiter: ',' })
    const records: string[][] = []
    parser.on('readable', () => {
      let record: string[]
      while ((record = parser.read()) !== null) {
        records.push(record)
      }
    })

    parser.on('end', () => {
      resolve(records)
    })

    parser.on('error', (err) => {
      reject(new Error('CSV parse error: ' + err.message))
    })

    parser.write(contents)
    parser.end()
  })

export const preflightCsv = async (
  contents: string,
  sample = 5
): Promise<string[][]> => {
  const res = await preflightCsvAll(contents)
  return res.slice(0, sample)
}

export const parseCsv = async <A>(
  contents: string,
  parseRow: (r: string[], rowNum: number) => A[]
): Promise<A[]> => {
  const res = await preflightCsvAll(contents)
  return res.flatMap((r, i) => parseRow(r, i))
}
