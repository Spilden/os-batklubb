import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let createdId: number
let memberUser: User
let adminUser: User

describe('camera-log-entries collection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    memberUser = await payload.create({
      collection: 'users',
      data: {
        email: 'camera-log-member-test@example.com',
        name: 'Medlem Testesen',
        password: 'test1234',
        roles: ['member'],
      },
    })

    adminUser = await payload.create({
      collection: 'users',
      data: {
        email: 'camera-log-admin-test@example.com',
        name: 'Admin Testesen',
        password: 'test1234',
        roles: ['admin'],
      },
    })
  })

  afterAll(async () => {
    if (createdId) {
      await payload.delete({
        collection: 'camera-log-entries',
        where: { id: { equals: createdId } },
      })
    }
    await payload.delete({ collection: 'users', where: { id: { equals: memberUser.id } } })
    await payload.delete({ collection: 'users', where: { id: { equals: adminUser.id } } })
  })

  it('creates an entry with required fields and defaults the source to live', async () => {
    const entry = await payload.create({
      collection: 'camera-log-entries',
      data: {
        date: new Date().toISOString(),
        authorName: 'Test Testesen',
        content: 'Alt i orden',
      },
    })
    createdId = entry.id

    expect(entry.authorName).toBe('Test Testesen')
    expect(entry.content).toBe('Alt i orden')
    expect(entry.source).toBe('live')
    expect(entry.user).toBeFalsy()
  })

  it('rejects create for an unauthenticated request', async () => {
    await expect(
      payload.create({
        collection: 'camera-log-entries',
        overrideAccess: false,
        data: {
          date: new Date().toISOString(),
          authorName: 'Uinnlogget',
          content: 'Skal ikke gå gjennom',
        },
      }),
    ).rejects.toThrow()
  })

  it('rejects read for an unauthenticated request', async () => {
    await expect(
      payload.find({ collection: 'camera-log-entries', overrideAccess: false }),
    ).rejects.toThrow()
  })

  it('forces authorName and user to the authenticated requester on create, ignoring spoofed values', async () => {
    const entry = await payload.create({
      collection: 'camera-log-entries',
      overrideAccess: false,
      user: memberUser,
      depth: 0,
      data: {
        date: new Date().toISOString(),
        authorName: 'Noen Andre',
        user: adminUser.id,
        content: 'Forsøk på å late som noen andre',
      },
    })

    expect(entry.authorName).toBe('Medlem Testesen')
    expect(entry.user).toBe(memberUser.id)

    await payload.delete({ collection: 'camera-log-entries', id: entry.id })
  })

  it('rejects update from a non-admin member but allows it for an admin', async () => {
    const entry = await payload.create({
      collection: 'camera-log-entries',
      data: {
        date: new Date().toISOString(),
        authorName: 'Medlem Testesen',
        content: 'Original tekst',
      },
    })

    await expect(
      payload.update({
        collection: 'camera-log-entries',
        id: entry.id,
        overrideAccess: false,
        user: memberUser,
        data: { content: 'Uautorisert forsøk' },
      }),
    ).rejects.toThrow()

    const updated = await payload.update({
      collection: 'camera-log-entries',
      id: entry.id,
      overrideAccess: false,
      user: adminUser,
      data: { content: 'Rettet av admin' },
    })
    expect(updated.content).toBe('Rettet av admin')

    await payload.delete({ collection: 'camera-log-entries', id: entry.id })
  })

  it('allows a member to update their own entry', async () => {
    const entry = await payload.create({
      collection: 'camera-log-entries',
      data: {
        date: new Date().toISOString(),
        authorName: 'Medlem Testesen',
        user: memberUser.id,
        content: 'Original tekst',
      },
    })

    const updated = await payload.update({
      collection: 'camera-log-entries',
      id: entry.id,
      overrideAccess: false,
      user: memberUser,
      data: { content: 'Rettet av meg selv' },
    })
    expect(updated.content).toBe('Rettet av meg selv')

    await payload.delete({ collection: 'camera-log-entries', id: entry.id })
  })

  it('ignores attempts to change authorName/user on update, even by the owner', async () => {
    const entry = await payload.create({
      collection: 'camera-log-entries',
      data: {
        date: new Date().toISOString(),
        authorName: 'Medlem Testesen',
        user: memberUser.id,
        content: 'Original tekst',
      },
    })

    const updated = await payload.update({
      collection: 'camera-log-entries',
      id: entry.id,
      overrideAccess: false,
      user: memberUser,
      depth: 0,
      data: { content: 'Rettet', authorName: 'Noen Andre', user: adminUser.id },
    })

    expect(updated.content).toBe('Rettet')
    expect(updated.authorName).toBe('Medlem Testesen')
    expect(updated.user).toBe(memberUser.id)

    await payload.delete({ collection: 'camera-log-entries', id: entry.id })
  })

  it('rejects delete from a non-admin member but allows it for an admin', async () => {
    const entry = await payload.create({
      collection: 'camera-log-entries',
      data: {
        date: new Date().toISOString(),
        authorName: 'Medlem Testesen',
        content: 'Skal slettes',
      },
    })

    await expect(
      payload.delete({
        collection: 'camera-log-entries',
        id: entry.id,
        overrideAccess: false,
        user: memberUser,
      }),
    ).rejects.toThrow()

    await payload.delete({
      collection: 'camera-log-entries',
      id: entry.id,
      overrideAccess: false,
      user: adminUser,
    })
  })
})
