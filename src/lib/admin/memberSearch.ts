export type SearchableMember = {
  id: number
  name: string
  email: string
  active: boolean
  roleKeys?: string[]
}

export type RoleFilter = 'all' | 'admin' | 'news_admin' | 'kameravakt'

/** Live search: every word in the query must appear in name or e-mail (case-insensitive, æøå-safe). */
export function filterMembers<T extends SearchableMember>(
  members: T[],
  query: string,
  includeInactive: boolean,
  role: RoleFilter = 'all',
): T[] {
  const words = query.toLocaleLowerCase('nb-NO').split(/\s+/).filter(Boolean)
  return members.filter((m) => {
    if (!includeInactive && !m.active) return false
    if (role !== 'all' && !m.roleKeys?.includes(role)) return false
    const haystack = `${m.name} ${m.email}`.toLocaleLowerCase('nb-NO')
    return words.every((w) => haystack.includes(w))
  })
}

export type MemberSortKey = 'name' | 'email' | 'since'
export type SortDirection = 'asc' | 'desc'

type SortableMember = { name: string; email: string; since: string | null }

const collator = new Intl.Collator('nb-NO', { sensitivity: 'base' })

/** Returns a sorted copy. Members without a date always end up last. */
export function sortMembers<T extends SortableMember>(
  members: T[],
  key: MemberSortKey,
  direction: SortDirection,
): T[] {
  const sign = direction === 'asc' ? 1 : -1
  return [...members].sort((a, b) => {
    if (key === 'since') {
      if (!a.since && !b.since) return 0
      if (!a.since) return 1
      if (!b.since) return -1
      return sign * a.since.localeCompare(b.since)
    }
    return sign * collator.compare(a[key], b[key])
  })
}
