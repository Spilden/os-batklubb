// @vitest-environment node
//
// Payload's file-upload pipeline checks `instanceof Uint8Array`, which fails
// under the default jsdom environment (a separate global realm) even for a
// freshly constructed Uint8Array. This file needs no DOM, so it runs in Node.
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterEach, expect } from 'vitest'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { parseContentBlocks, buildLexicalContent } from '@/scripts/news-import-helpers'
import { prepareNewsPosts, importNewsPosts, type RawNewsPost } from '@/scripts/news-import'

describe('parseContentBlocks', () => {
  it('extracts a text block per top-level element', () => {
    const blocks = parseContentBlocks('<p>Første avsnitt.</p><p>Andre avsnitt.</p>')
    expect(blocks).toEqual([
      { kind: 'text', text: 'Første avsnitt.' },
      { kind: 'text', text: 'Andre avsnitt.' },
    ])
  })

  it('marks a top-level element containing an img as an image block', () => {
    const blocks = parseContentBlocks(
      '<figure><a href="x.jpg"><img src="x-300x300.jpg" alt="" /></a></figure><p>Bildetekst.</p>',
    )
    expect(blocks).toEqual([{ kind: 'image' }, { kind: 'text', text: 'Bildetekst.' }])
  })

  it('skips empty and whitespace-only elements', () => {
    expect(parseContentBlocks('<p>&nbsp;</p><br/><p>Innhold.</p>')).toEqual([
      { kind: 'text', text: 'Innhold.' },
    ])
  })
})

describe('buildLexicalContent', () => {
  it('embeds the media id at the position of the first image block and drops later ones', () => {
    const content = buildLexicalContent(
      [{ kind: 'image' }, { kind: 'text', text: 'Tekst' }, { kind: 'image' }],
      42,
    )
    const children = content.root.children as Array<{ type: string; value?: number }>
    expect(children.map((c) => c.type)).toEqual(['upload', 'paragraph'])
    expect(children[0].value).toBe(42)
  })

  it('falls back to an empty paragraph when there are no blocks', () => {
    const content = buildLexicalContent([], null)
    expect(content.root.children).toHaveLength(1)
  })
})

// TESTFIKSTUR marker keeps these titles distinguishable from real imported data.
function rawPost(overrides: Partial<RawNewsPost>): RawNewsPost {
  return {
    id: 1,
    tittel: 'TESTFIKSTUR tittel',
    slug: 'testfikstur-tittel',
    dato: '2020-05-01T10:00:00',
    lenke: 'https://example.com/testfikstur-tittel',
    innhold_html: '<p>Innhold.</p>',
    innhold_tekst: 'Innhold.',
    antall_bilder: 0,
    bilder_i_innhold: [],
    featured_image: null,
    ...overrides,
  }
}

describe('prepareNewsPosts', () => {
  it('filters out the WordPress default post', () => {
    const { posts, skipped } = prepareNewsPosts([
      { posts: [rawPost({ tittel: 'Hei, verden!' })], imageDir: 'bilder1' },
    ])
    expect(posts).toHaveLength(0)
    expect(skipped).toEqual([{ id: 1, source: 'bilder1', reason: 'WordPress-standardinnlegg' }])
  })

  it('filters out a post with no text and no image', () => {
    const { posts, skipped } = prepareNewsPosts([
      { posts: [rawPost({ innhold_html: '', innhold_tekst: '', antall_bilder: 0 })], imageDir: 'bilder1' },
    ])
    expect(posts).toHaveLength(0)
    expect(skipped).toEqual([
      { id: 1, source: 'bilder1', reason: 'Tomt innlegg (ingen tekst eller bilde)' },
    ])
  })

  it('skips a duplicate post (same title and content) from a second source', () => {
    const post = rawPost({})
    const { posts, skipped } = prepareNewsPosts([
      { posts: [post], imageDir: 'bilder1' },
      { posts: [{ ...post, id: 2 }], imageDir: 'bilder2' },
    ])
    expect(posts).toHaveLength(1)
    expect(skipped).toContainEqual({
      id: 2,
      source: 'bilder2',
      reason: 'Duplikat av tidligere importert innlegg',
    })
  })

  it('falls back to the body text as title when tittel is empty', () => {
    const { posts } = prepareNewsPosts([
      {
        posts: [rawPost({ tittel: '', innhold_tekst: 'Vegen til Varga ferdig asfaltert!' })],
        imageDir: 'bilder1',
      },
    ])
    expect(posts[0].title).toBe('Vegen til Varga ferdig asfaltert!')
  })

  it('resolves the image path from the first content image, scoped to the source folder', () => {
    const { posts } = prepareNewsPosts([
      {
        posts: [
          rawPost({
            id: 42,
            bilder_i_innhold: ['http://example.com/wp-content/uploads/2020/05/bilde-300x300.jpg'],
          }),
        ],
        imageDir: 'varganytt_bilder1',
      },
    ])
    expect(posts[0].imagePath).toBe(
      path.join('migration_data', 'varganytt_bilder1', 'post_42', 'bilde-300x300.jpg'),
    )
  })
})

describe('importNewsPosts', () => {
  let payload: Payload
  const createdNewsIds: number[] = []
  const createdMediaIds: number[] = []
  let fixtureImagePath: string

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // A small real JPEG (not a fabricated byte sequence) so Payload's sharp-based
    // upload pipeline has something valid to process.
    const realJpeg = fs.readFileSync(
      path.resolve(process.cwd(), 'migration_data/varganytt_bilder2/post_106/Arsmote.jpg'),
    )
    fixtureImagePath = path.join(os.tmpdir(), 'testfikstur-news-import.jpg')
    fs.writeFileSync(fixtureImagePath, realJpeg)
  })

  afterEach(async () => {
    if (createdNewsIds.length > 0) {
      await payload.delete({ collection: 'news', where: { id: { in: [...createdNewsIds] } } })
      createdNewsIds.length = 0
    }
    if (createdMediaIds.length > 0) {
      await payload.delete({ collection: 'media', where: { id: { in: [...createdMediaIds] } } })
      createdMediaIds.length = 0
    }
  })

  it('creates a news doc without an image when none is referenced', async () => {
    const { posts } = prepareNewsPosts([
      { posts: [rawPost({ tittel: 'TESTFIKSTUR uten bilde' })], imageDir: 'bilder1' },
    ])

    const result = await importNewsPosts(payload, posts)
    expect(result).toEqual({ created: 1, alreadyExisted: 0, missingImages: 0 })

    const { docs } = await payload.find({
      collection: 'news',
      where: { title: { equals: 'TESTFIKSTUR uten bilde' } },
    })
    expect(docs).toHaveLength(1)
    expect(docs[0].image).toBeFalsy()
    createdNewsIds.push(...docs.map((d) => d.id))
  })

  it('counts a missing image file but still creates the news doc', async () => {
    const { posts } = prepareNewsPosts([
      {
        posts: [
          rawPost({
            tittel: 'TESTFIKSTUR manglende bilde',
            bilder_i_innhold: ['http://example.com/uploads/finnes-ikke.jpg'],
          }),
        ],
        imageDir: 'bilder-som-ikke-finnes',
      },
    ])

    const result = await importNewsPosts(payload, posts)
    expect(result).toEqual({ created: 1, alreadyExisted: 0, missingImages: 1 })

    const { docs } = await payload.find({
      collection: 'news',
      where: { title: { equals: 'TESTFIKSTUR manglende bilde' } },
    })
    createdNewsIds.push(...docs.map((d) => d.id))
  })

  it('uploads the referenced image and skips a post that already exists by title', async () => {
    const post = rawPost({
      tittel: 'TESTFIKSTUR med bilde',
      innhold_html: '<figure><img src="testfikstur.jpg" /></figure><p>Tekst.</p>',
      bilder_i_innhold: ['http://example.com/uploads/testfikstur.jpg'],
    })
    const { posts } = prepareNewsPosts([{ posts: [post], imageDir: 'ignored' }])
    posts[0].imagePath = fixtureImagePath

    const first = await importNewsPosts(payload, posts)
    expect(first).toEqual({ created: 1, alreadyExisted: 0, missingImages: 0 })

    const { docs } = await payload.find({
      collection: 'news',
      where: { title: { equals: 'TESTFIKSTUR med bilde' } },
    })
    expect(docs).toHaveLength(1)
    expect(docs[0].image).toBeTruthy()
    createdNewsIds.push(...docs.map((d) => d.id))
    for (const doc of docs) {
      const mediaId = typeof doc.image === 'object' && doc.image !== null ? doc.image.id : doc.image
      if (mediaId) createdMediaIds.push(mediaId)
    }

    const second = await importNewsPosts(payload, posts)
    expect(second).toEqual({ created: 0, alreadyExisted: 1, missingImages: 0 })
  })
})
