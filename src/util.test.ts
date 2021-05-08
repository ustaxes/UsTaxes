import { range, segments } from './util'

describe('segments', () => {
  const tests: Array<[number, number, string]> = [
    [13, 3, 'should split odd number of elements into odd segments'],
    [30, 7, 'should split even number of elements into odd segments'],
    [15, 4, 'should split odd number of elements into even segments'],
    [20, 7, 'should split even number of elements into odd segments']
  ]
  tests.map(([size, n, desc]) =>
    it(desc, () => {
      expect(segments(n, range(0, size)).flat()).toEqual(range(0, size))
    })
  )
})
