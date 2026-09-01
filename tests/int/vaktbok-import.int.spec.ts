import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterEach, expect } from 'vitest'
import { importVaktbokPosts, parseWpPost, type WpVaktbokPost } from '@/scripts/vaktbok-import'

let payload: Payload

const fixturePosts: WpVaktbokPost[] = [
  {
    status: 'publish',
    date: '2026-09-01T17:43:33',
    title: { rendered: 'ettermiddag tirsdag 01.09.26' },
    content: { rendered: '<p class="wp-block-paragraph">stille rolig.&nbsp;</p>' },
    author: 73,
    _embedded: { author: [{ name: 'Bjørg Frotveit' }] },
  },
  {
    status: 'publish',
    date: '2026-08-09T09:23:21',
    title: { rendered: 'vakt morgen' },
    content: { rendered: '' },
    author: 10,
  },
  {
    status: 'draft',
    date: '2026-08-01T09:00:00',
    title: { rendered: 'skal ikke importeres' },
    content: { rendered: '' },
    author: 10,
  },
]

describe('parseWpPost', () => {
  it('parses a post with content and a known author name', () => {
    const entry = parseWpPost(fixturePosts[0])
    expect(entry).toMatchObject({
      authorName: 'Bjørg Frotveit',
      period: 'ettermiddag',
      content: 'ettermiddag tirsdag 01.09.26\n\nstille rolig.',
      source: 'imported',
    })
  })

  it('falls back to a placeholder author name when the embed is missing', () => {
    const entry = parseWpPost(fixturePosts[1])
    expect(entry?.authorName).toBe('Bruker 10')
    expect(entry?.content).toBe('vakt morgen')
  })

  it('returns null for non-published posts', () => {
    expect(parseWpPost(fixturePosts[2])).toBeNull()
  })
})

describe('importVaktbokPosts', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(async () => {
    await payload.delete({
      collection: 'camera-log-entries',
      where: { source: { equals: 'imported' } },
    })
  })

  it('creates one entry per publishable post and skips the rest', async () => {
    const created = await importVaktbokPosts(payload, fixturePosts)
    expect(created).toBe(2)

    const { docs } = await payload.find({
      collection: 'camera-log-entries',
      where: { source: { equals: 'imported' } },
    })
    expect(docs).toHaveLength(2)
  })
})
