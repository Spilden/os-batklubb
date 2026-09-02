import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

const emails = {
  memberA: 'access-test-member-a@example.com',
  memberB: 'access-test-member-b@example.com',
}

async function makeMember(email: string, name: string): Promise<User> {
  return payload.create({
    collection: 'users',
    data: { email, name, password: 'test1234', roles: ['member'] },
  })
}

async function cleanup() {
  for (const email of Object.values(emails)) {
    await payload.delete({ collection: 'users', where: { email: { equals: email } } })
  }
}

describe('Access control', () => {
  let memberA: User
  let memberB: User

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    await cleanup()
    memberA = await makeMember(emails.memberA, 'Member A')
    memberB = await makeMember(emails.memberB, 'Member B')
  })

  afterAll(async () => {
    await cleanup()
  })

  it('does not allow a regular member to grant themselves the admin role', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: memberA.id,
      data: { roles: ['admin'] },
      overrideAccess: false,
      user: memberA,
    })

    expect(updated.roles).not.toContain('admin')
  })

  it('does not allow a regular member to read other users', async () => {
    await expect(
      payload.findByID({
        collection: 'users',
        id: memberB.id,
        overrideAccess: false,
        user: memberA,
      }),
    ).rejects.toThrow()
  })

  it('does not allow anonymous requests to read contact submissions', async () => {
    await expect(
      payload.find({
        collection: 'contact-submissions',
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it("does not allow a member to read another member's clubhouse booking", async () => {
    const booking = await payload.create({
      collection: 'clubhouse-bookings',
      data: {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        user: memberA.id,
        status: 'pending',
      },
    })

    await expect(
      payload.findByID({
        collection: 'clubhouse-bookings',
        id: booking.id,
        overrideAccess: false,
        user: memberB,
      }),
    ).rejects.toThrow()
  })

  it("does not allow a member to approve another member's slipp booking", async () => {
    const booking = await payload.create({
      collection: 'slipp-bookings',
      data: {
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        user: memberA.id,
        status: 'pending',
      },
    })

    await expect(
      payload.update({
        collection: 'slipp-bookings',
        id: booking.id,
        data: { status: 'approved' },
        overrideAccess: false,
        user: memberB,
      }),
    ).rejects.toThrow()
  })

  it("does not allow a member to delete another member's event", async () => {
    const event = await payload.create({
      collection: 'events',
      data: {
        title: 'Test',
        description: 'Test',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        user: memberA.id,
        status: 'draft',
      },
    })

    await expect(
      payload.delete({
        collection: 'events',
        id: event.id,
        overrideAccess: false,
        user: memberB,
      }),
    ).rejects.toThrow()
  })
})
