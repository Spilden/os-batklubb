import type { Payload } from 'payload'
import type { User } from '@/payload-types'
import { requireAdmin } from './requireAdmin'

export type OverviewRow = {
  key: string
  name: string
  entries: Array<{ date: string; content: string }>
}

/**
 * Reports per person within a date range (fromISO inclusive, toISO exclusive). Reports linked to a user are grouped
 * by that user (shown with their current name, so renames don't split them);
 * reports without a user (imported history) are grouped by authorName. Active
 * kameravakter with no reports are included; deactivated ones only if they
 * reported in the range.
 */
export async function buildVaktbokOverview(
  payload: Payload,
  admin: User,
  range: { fromISO: string; toISO: string },
): Promise<OverviewRow[]> {
  requireAdmin(admin)

  const [{ docs: entries }, { docs: users }] = await Promise.all([
    payload.find({
      collection: 'camera-log-entries',
      where: {
        date: { greater_than_equal: range.fromISO, less_than: range.toISO },
      },
      sort: '-date',
      limit: 0,
      depth: 0,
      user: admin,
      overrideAccess: false,
    }),
    payload.find({
      collection: 'users',
      limit: 0,
      depth: 0,
      select: { name: true, roles: true, active: true },
      user: admin,
      overrideAccess: false,
    }),
  ])

  const usersById = new Map(users.map((u) => [u.id, u]))
  const rows = new Map<string, OverviewRow>()

  for (const u of users) {
    if (u.active !== false && u.roles?.includes('kameravakt')) {
      rows.set(`user:${u.id}`, { key: `user:${u.id}`, name: u.name, entries: [] })
    }
  }

  for (const entry of entries) {
    const userId = typeof entry.user === 'object' ? entry.user?.id : entry.user
    const linkedUser = userId ? usersById.get(userId) : undefined
    const key = linkedUser ? `user:${linkedUser.id}` : `name:${entry.authorName}`
    let row = rows.get(key)
    if (!row) {
      row = { key, name: linkedUser?.name ?? entry.authorName, entries: [] }
      rows.set(key, row)
    }
    row.entries.push({ date: entry.date, content: entry.content })
  }

  return [...rows.values()].sort((a, b) => a.entries.length - b.entries.length)
}
