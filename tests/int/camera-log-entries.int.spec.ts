import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
let createdId: number

describe('camera-log-entries collection', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    if (createdId) {
      await payload.delete({
        collection: 'camera-log-entries',
        where: { id: { equals: createdId } },
      })
    }
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
    expect(entry.period).toBeFalsy()
  })
})
