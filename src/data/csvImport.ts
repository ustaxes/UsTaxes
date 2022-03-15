import { parse, ParseError } from 'papaparse'
import { Either, left, right, run } from 'ustaxes/core/util'

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

export type Parsed<Row> = Either<ParseError[], Row[]>

const parseEither = (contents: string): Parsed<string[]> => {
  const res = parse<string[]>(contents, {
    skipEmptyLines: true,
    delimiter: ','
  })
  if (res.errors.length > 0) {
    return left(res.errors)
  }
  return right(res.data)
}

export const preflightCsvAll = (contents: string): Parsed<string[]> =>
  parseEither(contents)

export const preflightCsvAllOrThrow = (contents: string): string[][] =>
  run(parseEither(contents)).orThrow()

export const preflightCsv = (contents: string, sample = 5): Parsed<string[]> =>
  run(preflightCsvAll(contents))
    .map((data) => data.slice(0, sample))
    .value()

export const preflightCsvOrThrow = (contents: string, sample = 5): string[][] =>
  run(preflightCsv(contents, sample)).orThrow()

export const parseCsv = <A>(
  contents: string,
  parseRow: (r: string[], rowNum: number) => A[]
): Parsed<A> =>
  run(preflightCsvAll(contents))
    .map((data) => data.flatMap<A>((row, i) => parseRow(row, i)))
    .value()

export const parseCsvOrThrow = <A>(
  contents: string,
  parseRow: (r: string[], rowNum: number) => A[]
): A[] => run(parseCsv(contents, parseRow)).orThrow()
