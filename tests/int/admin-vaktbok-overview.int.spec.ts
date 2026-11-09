// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import { buildVaktbokOverview } from '@/lib/admin/vaktbokOverview'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

const YEAR = 2099
const IMPORTED_NAME = 'Admin-test Importert Person'
const emails = {
  admin: 'admin-test-vb-admin@example.com',
  renamed: 'admin-test-vb-renamed@example.com',
  idle: 'admin-test-vb-idle@example.com',
  inactiveIdle: 'admin-test-vb-inactive-idle@example.com',
  inactiveWithReports: 'admin-test-vb-inactive-reports@example.com',
}

async function cleanup() {
  await payload.delete({
    collection: 'camera-log-entries',
    where: {
      date: {
        greater_than_equal: new Date(YEAR, 0, 1).toISOString(),
        less_than: new Date(YEAR + 1, 0, 1).toISOString(),
      },
    },
  })
  for (const email of Object.values(emails)) {
    await payload.delete({ collection: 'users', where: { email: { equals: email } } })
  }
}

async function makeVakt(email: string, name: string, active = true): Promise<User> {
  return payload.create({
    collection: 'users',
    data: { email, name, password: 'test1234', roles: ['member', 'kameravakt'], active },
  })
}

async function report(user: User | null, authorName: string, month: number) {
  await payload.create({
    collection: 'camera-log-entries',
    data: {
      date: new Date(YEAR, month, 1, 12).toISOString(),
      user: user?.id,
      authorName,
      content: 'Alt rolig',
      source: user ? 'live' : 'imported',
    },
  })
}

describe('buildVaktbokOverview', () => {
  let admin: User
  let renamed: User
  let rows: Awaited<ReturnType<typeof buildVaktbokOverview>>

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await cleanup()
    admin = await payload.create({
      collection: 'users',
      data: { email: emails.admin, name: 'VB Admin', password: 'test1234', roles: ['member', 'admin'] },
    })
    renamed = await makeVakt(emails.renamed, 'Admin-test Gammelt Navn')
    await report(renamed, 'Admin-test Gammelt Navn', 1)
    await payload.update({ collection: 'users', id: renamed.id, data: { name: 'Admin-test Nytt Navn' } })

    await report(null, IMPORTED_NAME, 2)
    await report(null, IMPORTED_NAME, 3)

    await makeVakt(emails.idle, 'Admin-test Uten Rapporter')
    await makeVakt(emails.inactiveIdle, 'Admin-test Deaktivert Uten', false)
    const inactiveWithReports = await makeVakt(emails.inactiveWithReports, 'Admin-test Deaktivert Med')
    await report(inactiveWithReports, 'Admin-test Deaktivert Med', 4)
    await payload.update({
      collection: 'users',
      id: inactiveWithReports.id,
      data: { active: false },
    })

    rows = await buildVaktbokOverview(payload, admin, {
      fromISO: new Date(YEAR, 0, 1).toISOString(),
      toISO: new Date(YEAR + 1, 0, 1).toISOString(),
    })
  })

  afterAll(async () => {
    await cleanup()
  })

  const row = (name: string) => rows.find((r) => r.name === name)

  it('groups by user and uses current name after rename', () => {
    expect(row('Admin-test Nytt Navn')?.entries).toHaveLength(1)
    expect(row('Admin-test Gammelt Navn')).toBeUndefined()
  })

  it('imported entries without user are grouped by authorName', () => {
    expect(row(IMPORTED_NAME)?.entries).toHaveLength(2)
  })

  it('active kameravakt without reports is listed with zero entries', () => {
    expect(row('Admin-test Uten Rapporter')?.entries).toHaveLength(0)
  })

  it('deactivated kameravakt without reports is not listed', () => {
    expect(row('Admin-test Deaktivert Uten')).toBeUndefined()
  })

  it('deactivated kameravakt with reports is still counted', () => {
    expect(row('Admin-test Deaktivert Med')?.entries).toHaveLength(1)
  })

  it('only counts reports inside the range', async () => {
    const narrow = await buildVaktbokOverview(payload, admin, {
      fromISO: new Date(YEAR, 2, 1).toISOString(),
      toISO: new Date(YEAR, 3, 1).toISOString(),
    })
    // March only: one imported report (the other is 1 April), none from the renamed user (February).
    expect(narrow.find((r) => r.name === IMPORTED_NAME)?.entries).toHaveLength(1)
    expect(narrow.find((r) => r.name === 'Admin-test Nytt Navn')?.entries).toHaveLength(0)
  })

  it('sorts by number of reports ascending', () => {
    const counts = rows.map((r) => r.entries.length)
    expect(counts).toEqual([...counts].sort((a, b) => a - b))
  })
})
