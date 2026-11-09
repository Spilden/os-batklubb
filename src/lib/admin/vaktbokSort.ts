export type OverviewSortKey = 'name' | 'count' | 'last'
export type OverviewSortDirection = 'asc' | 'desc'

type SortableRow = { name: string; count: number; last: string | null }

const collator = new Intl.Collator('nb-NO', { sensitivity: 'base' })

/** Returns a sorted copy. Ties fall back to name; people without reports sort last by date. */
export function sortOverviewRows<T extends SortableRow>(
  rows: T[],
  key: OverviewSortKey,
  direction: OverviewSortDirection,
): T[] {
  const sign = direction === 'asc' ? 1 : -1
  const byName = (a: T, b: T) => collator.compare(a.name, b.name)
  return [...rows].sort((a, b) => {
    if (key === 'name') return sign * byName(a, b)
    if (key === 'count') return sign * (a.count - b.count) || byName(a, b)
    if (!a.last && !b.last) return byName(a, b)
    if (!a.last) return 1
    if (!b.last) return -1
    return sign * a.last.localeCompare(b.last) || byName(a, b)
  })
}
