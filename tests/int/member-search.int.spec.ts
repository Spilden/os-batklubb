import { describe, it, expect } from 'vitest'
import { filterMembers, sortMembers } from '@/lib/admin/memberSearch'

const members = [
  { id: 1, name: 'Øystein Ås', email: 'oystein@example.com', active: true, roleKeys: ['member', 'admin'] },
  { id: 2, name: 'Kari Nordmann', email: 'kari@eksempel.no', active: true, roleKeys: ['member', 'news_admin'] },
  { id: 3, name: 'Gamle Ola', email: 'ola@example.com', active: false, roleKeys: ['member', 'admin'] },
]

describe('filterMembers', () => {
  it('matches name case-insensitively including æøå', () => {
    expect(filterMembers(members, 'øYST', false).map((m) => m.id)).toEqual([1])
    expect(filterMembers(members, 'ås', false).map((m) => m.id)).toEqual([1])
  })

  it('matches email', () => {
    expect(filterMembers(members, 'eksempel.no', false).map((m) => m.id)).toEqual([2])
  })

  it('hides inactive unless asked', () => {
    expect(filterMembers(members, 'ola', false)).toHaveLength(0)
    expect(filterMembers(members, 'ola', true).map((m) => m.id)).toEqual([3])
  })

  it('empty query returns all (respecting inactive filter)', () => {
    expect(filterMembers(members, '  ', false).map((m) => m.id)).toEqual([1, 2])
  })

  it('filters by role', () => {
    expect(filterMembers(members, '', false, 'admin').map((m) => m.id)).toEqual([1])
    expect(filterMembers(members, '', true, 'admin').map((m) => m.id)).toEqual([1, 3])
    expect(filterMembers(members, '', false, 'news_admin').map((m) => m.id)).toEqual([2])
    expect(filterMembers(members, '', false, 'kameravakt')).toHaveLength(0)
    expect(filterMembers(members, '', false, 'all').map((m) => m.id)).toEqual([1, 2])
  })

  it('matches every word in any order', () => {
    expect(filterMembers(members, 'nordmann kari', false).map((m) => m.id)).toEqual([2])
  })
})

describe('sortMembers', () => {
  const rows = [
    { id: 1, name: 'Øystein', email: 'b@x.no', since: '2020-01-01' },
    { id: 2, name: 'Anne', email: 'c@x.no', since: null },
    { id: 3, name: 'Åse', email: 'a@x.no', since: '2015-06-01' },
    { id: 4, name: 'Bjørn', email: 'd@x.no', since: '2023-03-03' },
  ]
  const ids = (r: { id: number }[]) => r.map((m) => m.id)

  it('sorts by name with Norwegian alphabet order', () => {
    expect(ids(sortMembers(rows, 'name', 'asc'))).toEqual([2, 4, 1, 3])
    expect(ids(sortMembers(rows, 'name', 'desc'))).toEqual([3, 1, 4, 2])
  })

  it('sorts by email', () => {
    expect(ids(sortMembers(rows, 'email', 'asc'))).toEqual([3, 1, 2, 4])
  })

  it('sorts by date with missing dates last in both directions', () => {
    expect(ids(sortMembers(rows, 'since', 'asc'))).toEqual([3, 1, 4, 2])
    expect(ids(sortMembers(rows, 'since', 'desc'))).toEqual([4, 1, 3, 2])
  })

  it('does not mutate the input', () => {
    const copy = [...rows]
    sortMembers(rows, 'name', 'desc')
    expect(rows).toEqual(copy)
  })
})
