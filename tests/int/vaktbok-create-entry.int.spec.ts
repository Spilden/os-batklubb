import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, afterEach, expect } from 'vitest'
import { createVaktbokEntry } from '@/app/(frontend)/members/vaktbok/createEntry'

let payload: Payload
let testUserId: number
const createdEntryIds: number[] = []

describe('createVaktbokEntry', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
    const user = await payload.create({
      collection: 'users',
      data: {
        email: 'vaktbok-test@example.com',
        name: 'Test Testesen',
        password: 'test1234',
        roles: ['member'],
      },
    })
    testUserId = user.id
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
    await payload.delete({ collection: 'users', where: { id: { equals: testUserId } } })
  })

  it('creates a live entry with the given content and period', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUserId,
      userName: 'Test Testesen',
      content: '  Alt i orden  ',
      period: 'kveld',
    })
    createdEntryIds.push(entry.id)

    expect(entry.authorName).toBe('Test Testesen')
    expect(entry.content).toBe('Alt i orden')
    expect(entry.period).toBe('kveld')
    expect(entry.source).toBe('live')
  })

  it('omits period when it is not one of the known values', async () => {
    const entry = await createVaktbokEntry(payload, {
      userId: testUserId,
      userName: 'Test Testesen',
      content: 'Alt i orden',
      period: 'ikke-en-periode',
    })
    createdEntryIds.push(entry.id)

    expect(entry.period).toBeFalsy()
  })

  it('throws when content is empty after trimming', async () => {
    await expect(
      createVaktbokEntry(payload, { userId: testUserId, userName: 'Test Testesen', content: '   ' }),
    ).rejects.toThrow('Rapporten kan ikke være tom')
  })
})
