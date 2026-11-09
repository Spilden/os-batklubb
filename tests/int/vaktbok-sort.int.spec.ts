import { describe, it, expect } from 'vitest'
import { sortOverviewRows } from '@/lib/admin/vaktbokSort'

const rows = [
  { key: 'a', name: 'Øyvind', count: 3, last: '2099-03-01T10:00:00.000Z' },
  { key: 'b', name: 'Anne', count: 0, last: null },
  { key: 'c', name: 'Åse', count: 5, last: '2099-01-15T10:00:00.000Z' },
  { key: 'd', name: 'Bjørn', count: 3, last: '2099-06-01T10:00:00.000Z' },
]
const keys = (r: { key: string }[]) => r.map((x) => x.key)

describe('sortOverviewRows', () => {
  it('sorts by count, ties broken by name', () => {
    expect(keys(sortOverviewRows(rows, 'count', 'asc'))).toEqual(['b', 'd', 'a', 'c'])
    expect(keys(sortOverviewRows(rows, 'count', 'desc'))).toEqual(['c', 'd', 'a', 'b'])
  })

  it('sorts by name in Norwegian order', () => {
    expect(keys(sortOverviewRows(rows, 'name', 'asc'))).toEqual(['b', 'd', 'a', 'c'])
  })

  it('sorts by last report with people without reports last', () => {
    expect(keys(sortOverviewRows(rows, 'last', 'desc'))).toEqual(['d', 'a', 'c', 'b'])
    expect(keys(sortOverviewRows(rows, 'last', 'asc'))).toEqual(['c', 'a', 'd', 'b'])
  })
})
