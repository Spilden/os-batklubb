import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import type { User } from '@/payload-types'
import { createVaktbokEntry, updateVaktbokEntry } from '@/app/(frontend)/members/vaktbok/createEntry'

let payload: Payload
let testUser: User
let otherUser: User
const createdEntryIds: number[] = []

beforeAll(async () => {
  const payloadConfig = await config
  payload = await getPayload({ config: payloadConfig })
  testUser = await payload.create({
    collection: 'users',
    data: {
      email: 'vaktbok-test@example.com',
      name: 'Test Testesen',
      password: 'test1234',
      roles: ['member'],
    },
  })
  otherUser = await payload.create({
    collection: 'users',
    data: {
      email: 'vaktbok-test-other@example.com',
      name: 'Annen Testesen',
      password: 'test1234',
      roles: ['member'],
    },
  })
})

afterEach(async () => {
  if (createdEntryIds.length === 0) return
  await payload.delete({
    collection: 'camera-log-entries',
    where: { id: { in: [...createdEntryIds] } },
  })
  createdEntryIds.length = 0
})

afterAll(async () => {
  await payload.delete({ collection: 'users', where: { id: { equals: testUser.id } } })
  await payload.delete({ collection: 'users', where: { id: { equals: otherUser.id } } })
})

describe('createVaktbokEntry', () => {
  it('creates a live entry with the given content', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUser.id,
      userName: 'Test Testesen',
      content: '  Alt i orden  ',
    })
    createdEntryIds.push(entry.id)

    expect(entry.authorName).toBe('Test Testesen')
    expect(entry.content).toBe('Alt i orden')
    expect(entry.source).toBe('live')
  })

  it('throws when content is empty after trimming', async () => {
    await expect(
      createVaktbokEntry(payload, { userId: testUser.id, userName: 'Test Testesen', content: '   ' }),
    ).rejects.toThrow('Rapporten kan ikke være tom')
  })
})

describe('updateVaktbokEntry', () => {
  it('lets a user update their own entry', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUser.id,
      userName: 'Test Testesen',
      content: 'Original',
    })
    createdEntryIds.push(entry.id)

    const updated = await updateVaktbokEntry(payload, {
      entryId: entry.id,
      user: testUser,
      content: 'Rettet',
    })

    expect(updated.content).toBe('Rettet')
  })

  it('rejects updating someone else\'s entry', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUser.id,
      userName: 'Test Testesen',
      content: 'Original',
    })
    createdEntryIds.push(entry.id)

    await expect(
      updateVaktbokEntry(payload, { entryId: entry.id, user: otherUser, content: 'Uautorisert' }),
    ).rejects.toThrow()
  })

  it('throws when content is empty after trimming', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUser.id,
      userName: 'Test Testesen',
      content: 'Original',
    })
    createdEntryIds.push(entry.id)

    await expect(
      updateVaktbokEntry(payload, { entryId: entry.id, user: testUser, content: '   ' }),
    ).rejects.toThrow('Rapporten kan ikke være tom')
  })
})
