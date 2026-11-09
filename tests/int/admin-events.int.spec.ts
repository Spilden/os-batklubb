// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import {
  createEvent,
  deleteEvent,
  listEvents,
  parseEventInput,
  updateEvent,
} from '@/lib/admin/events'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

const TITLE_PREFIX = 'Admin-test happening'
const emails = {
  admin: 'admin-test-events-admin@example.com',
  member: 'admin-test-events-member@example.com',
}

async function cleanup() {
  await payload.delete({ collection: 'events', where: { title: { like: TITLE_PREFIX } } })
  for (const email of Object.values(emails)) {
    await payload.delete({ collection: 'users', where: { email: { equals: email } } })
  }
}

function form(values: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(values)) fd.set(k, v)
  return fd
}

const validValues = {
  title: `${TITLE_PREFIX} dugnad`,
  description: 'Vårdugnad på kaia',
  startTime: '2099-05-01T16:00:00.000Z',
  endTime: '2099-05-01T19:00:00.000Z',
  color: '#2563eb',
  status: 'published',
}

describe('Admin events', () => {
  let admin: User
  let member: User

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await cleanup()
    admin = await payload.create({
      collection: 'users',
      data: { email: emails.admin, name: 'Ev Admin', password: 'test1234', roles: ['member', 'admin'] },
    })
    member = await payload.create({
      collection: 'users',
      data: { email: emails.member, name: 'Ev Medlem', password: 'test1234', roles: ['member'] },
    })
  })

  afterAll(async () => {
    await cleanup()
  })

  it('member cannot create event via local API', async () => {
    await expect(
      payload.create({
        collection: 'events',
        data: { ...parseEventInput(form(validValues)), user: member.id },
        user: member,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('admin can create, update and delete event', async () => {
    const created = await createEvent(payload, admin, parseEventInput(form(validValues)))
    expect(created.status).toBe('published')
    const createdUser = typeof created.user === 'object' ? created.user.id : created.user
    expect(createdUser).toBe(admin.id)

    const updated = await updateEvent(payload, admin, created.id, {
      ...parseEventInput(form(validValues)),
      status: 'cancelled',
    })
    expect(updated.status).toBe('cancelled')

    await deleteEvent(payload, admin, created.id)
    await expect(payload.findByID({ collection: 'events', id: created.id })).rejects.toThrow()
  })

  it('non-admin cannot use createEvent', async () => {
    await expect(createEvent(payload, member, parseEventInput(form(validValues)))).rejects.toThrow(
      'Kun for admin',
    )
  })

  it('parseEventInput rejects end before start', () => {
    expect(() =>
      parseEventInput(form({ ...validValues, endTime: validValues.startTime })),
    ).toThrow('Slutt må være etter start.')
  })

  it('parseEventInput rejects empty title', () => {
    expect(() => parseEventInput(form({ ...validValues, title: '  ' }))).toThrow(
      'Tittel må fylles ut.',
    )
  })

  it('parseEventInput rejects invalid date and unknown status', () => {
    expect(() => parseEventInput(form({ ...validValues, startTime: 'nonsense' }))).toThrow(
      'Ugyldig dato.',
    )
    expect(parseEventInput(form({ ...validValues, status: 'hacked' })).status).toBe('draft')
  })

  it('listEvents separates upcoming and past', async () => {
    const future = await createEvent(payload, admin, {
      ...parseEventInput(form(validValues)),
      title: `${TITLE_PREFIX} fremtid`,
    })
    const past = await createEvent(payload, admin, {
      ...parseEventInput(form(validValues)),
      title: `${TITLE_PREFIX} fortid`,
      startTime: '2000-01-01T10:00:00.000Z',
      endTime: '2000-01-01T12:00:00.000Z',
    })

    const upcoming = (await listEvents(payload, admin, { past: false })).map((e) => e.id)
    const earlier = (await listEvents(payload, admin, { past: true })).map((e) => e.id)
    expect(upcoming).toContain(future.id)
    expect(upcoming).not.toContain(past.id)
    expect(earlier).toContain(past.id)
    expect(earlier).not.toContain(future.id)
  })
})
