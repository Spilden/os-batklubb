import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'
import { buildLexicalContent, decodeHtmlEntities, parseContentBlocks, type ContentBlock } from './news-import-helpers'

export type RawNewsPost = {
  id: number
  tittel: string
  slug: string
  dato: string
  lenke: string
  innhold_html: string
  innhold_tekst: string
  antall_bilder: number
  bilder_i_innhold: string[]
  featured_image: string | null
}

export type NewsSource = {
  posts: RawNewsPost[]
  // Each source site has its own image folder and its own id sequence - ids
  // collide between sources by coincidence, so images must be resolved
  // per-source, never by id alone.
  imageDir: string
}

export type ParsedNewsPost = {
  title: string
  excerpt: string
  publishedAt: string
  contentBlocks: ContentBlock[]
  imagePath: string | null
}

export type SkippedPost = {
  id: number
  source: string
  reason: string
}

const NOISE_TITLE = 'Hei, verden!'

function excerptFrom(text: string): string {
  const trimmed = decodeHtmlEntities(text).trim()
  if (trimmed.length <= 200) return trimmed
  return trimmed.slice(0, 200).trimEnd() + '…'
}

function resolveImagePath(post: RawNewsPost, imageDir: string): string | null {
  if (post.bilder_i_innhold.length === 0) return null
  const filename = decodeURIComponent(new URL(post.bilder_i_innhold[0]).pathname.split('/').pop() ?? '')
  if (!filename) return null
  return path.join('migration_data', imageDir, `post_${post.id}`, filename)
}

export function prepareNewsPosts(sources: NewsSource[]): {
  posts: ParsedNewsPost[]
  skipped: SkippedPost[]
} {
  const posts: ParsedNewsPost[] = []
  const skipped: SkippedPost[] = []
  const seen = new Set<string>()

  for (const source of sources) {
    for (const raw of source.posts) {
      if (raw.tittel.trim() === NOISE_TITLE) {
        skipped.push({ id: raw.id, source: source.imageDir, reason: 'WordPress-standardinnlegg' })
        continue
      }

      // A handful of source posts have no body text and no image at all (an
      // empty stub, a leftover "testing" post). Payload's required content
      // field rejects an all-empty paragraph, and there's nothing to import anyway.
      if (!raw.innhold_tekst.trim() && raw.antall_bilder === 0) {
        skipped.push({ id: raw.id, source: source.imageDir, reason: 'Tomt innlegg (ingen tekst eller bilde)' })
        continue
      }

      const dedupeKey = `${raw.tittel}|${raw.innhold_tekst}`
      if (seen.has(dedupeKey)) {
        skipped.push({ id: raw.id, source: source.imageDir, reason: 'Duplikat av tidligere importert innlegg' })
        continue
      }
      seen.add(dedupeKey)

      // A few WP posts have no title set at all - the "headline" only exists as
      // styled text inside the body. Fall back to the body text so News.title
      // (required) never ends up empty.
      const title =
        decodeHtmlEntities(raw.tittel).trim() ||
        decodeHtmlEntities(raw.innhold_tekst).trim().slice(0, 100) ||
        'Uten tittel'

      posts.push({
        title,
        excerpt: excerptFrom(raw.innhold_tekst),
        publishedAt: new Date(raw.dato).toISOString(),
        contentBlocks: parseContentBlocks(raw.innhold_html),
        imagePath: resolveImagePath(raw, source.imageDir),
      })
    }
  }

  return { posts, skipped }
}

function mimeTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg'
  return 'application/octet-stream'
}

export async function importNewsPosts(
  payload: Payload,
  posts: ParsedNewsPost[],
): Promise<{ created: number; alreadyExisted: number; missingImages: number }> {
  let created = 0
  let alreadyExisted = 0
  let missingImages = 0

  for (const post of posts) {
    const existing = await payload.find({
      collection: 'news',
      where: { title: { equals: post.title } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      alreadyExisted += 1
      continue
    }

    let mediaId: number | null = null
    if (post.imagePath) {
      if (fs.existsSync(post.imagePath)) {
        const buffer = fs.readFileSync(post.imagePath)
        const media = await payload.create({
          collection: 'media',
          data: { alt: post.title },
          file: {
            data: buffer,
            mimetype: mimeTypeFor(post.imagePath),
            name: path.basename(post.imagePath),
            size: buffer.length,
          },
        })
        mediaId = media.id
      } else {
        missingImages += 1
      }
    }

    await payload.create({
      collection: 'news',
      data: {
        title: post.title,
        excerpt: post.excerpt,
        content: buildLexicalContent(post.contentBlocks, mediaId),
        image: mediaId ?? undefined,
        publishedAt: post.publishedAt,
      },
    })
    created += 1
  }

  return { created, alreadyExisted, missingImages }
}
