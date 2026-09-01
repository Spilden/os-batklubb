import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterEach, expect } from 'vitest'
import { importVaktbokPosts, parseWpPost, type WpVaktbokPost } from '@/scripts/vaktbok-import'
import { buildReportText } from '@/scripts/vaktbok-import-helpers'

let payload: Payload
const createdEntryIds: number[] = []

// Dates and titles use a "TESTFIKSTUR" marker and a year (1999) far outside the real
// migration dataset's range, so content-based matching below can never collide with real
// imported data (e.g. from `npm run import:vaktbok`).
const fixturePosts: WpVaktbokPost[] = [
  {
    status: 'publish',
    date: '1999-01-01T17:43:33',
    title: { rendered: 'TESTFIKSTUR-a ettermiddag tirsdag' },
    content: { rendered: '<p class="wp-block-paragraph">stille rolig.&nbsp;</p>' },
    author: 73,
    _embedded: { author: [{ name: 'TESTFIKSTUR Forfatter' }] },
  },
  {
    status: 'publish',
    date: '1999-01-02T09:23:21',
    title: { rendered: 'TESTFIKSTUR-b vakt morgen' },
    content: { rendered: '' },
    author: 10,
  },
  {
    status: 'draft',
    date: '1999-01-03T09:00:00',
    title: { rendered: 'TESTFIKSTUR-c skal ikke importeres' },
    content: { rendered: '' },
    author: 10,
  },
  {
    status: 'publish',
    date: '1999-01-04T09:00:00',
    title: { rendered: '' },
    content: { rendered: '' },
    author: 10,
  },
]

describe('parseWpPost', () => {
  it('parses a post with content and a known author name', () => {
    const entry = parseWpPost(fixturePosts[0])
    expect(entry).toMatchObject({
      authorName: 'TESTFIKSTUR Forfatter',
      content: 'TESTFIKSTUR-a ettermiddag tirsdag\n\nstille rolig.',
      source: 'imported',
    })
  })

  it('falls back to a placeholder author name when the embed is missing', () => {
    const entry = parseWpPost(fixturePosts[1])
    expect(entry?.authorName).toBe('Bruker 10')
    expect(entry?.content).toBe('TESTFIKSTUR-b vakt morgen')
  })

  it('returns null for non-published posts', () => {
    expect(parseWpPost(fixturePosts[2])).toBeNull()
  })

  it('returns null when both title and content are empty', () => {
    expect(parseWpPost(fixturePosts[3])).toBeNull()
  })
})

describe('importVaktbokPosts', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(async () => {
    if (createdEntryIds.length === 0) return
    await payload.delete({
      collection: 'camera-log-entries',
      where: { id: { in: [...createdEntryIds] } },
    })
    createdEntryIds.length = 0
  })

  it('creates one entry per publishable post and skips the rest', async () => {
    const created = await importVaktbokPosts(payload, fixturePosts)
    expect(created).toBe(2)

    // Content is deterministic from the fixture (title + stripped body). Combined with the
    // TESTFIKSTUR marker and 1999 dates (far outside the real dataset's range), this can only
    // ever match the two rows this test just created — never pre-existing imported data.
    const expectedContents = [
      buildReportText(fixturePosts[0].title.rendered, fixturePosts[0].content.rendered),
      buildReportText(fixturePosts[1].title.rendered, fixturePosts[1].content.rendered),
    ]
    const expectedDates = [
      new Date(fixturePosts[0].date).toISOString(),
      new Date(fixturePosts[1].date).toISOString(),
    ]

    const { docs } = await payload.find({
      collection: 'camera-log-entries',
      where: {
        and: [
          { source: { equals: 'imported' } },
          { content: { in: expectedContents } },
          { date: { in: expectedDates } },
        ],
      },
    })
    expect(docs).toHaveLength(2)
    createdEntryIds.push(...docs.map((doc) => doc.id))
  })
})
