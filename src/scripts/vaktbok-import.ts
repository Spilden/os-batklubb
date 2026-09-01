import type { Payload } from 'payload'
import { buildReportText } from './vaktbok-import-helpers'

export type WpVaktbokPost = {
  status: string
  date: string
  title: { rendered: string }
  content: { rendered: string }
  author: number
  _embedded?: { author?: Array<{ name?: string }> }
}

export type ParsedVaktbokEntry = {
  date: string
  authorName: string
  content: string
  source: 'imported'
}

export function parseWpPost(post: WpVaktbokPost): ParsedVaktbokEntry | null {
  if (post.status !== 'publish') return null

  const title = post.title.rendered
  const content = buildReportText(title, post.content.rendered)
  if (!content) return null

  const authorName = post._embedded?.author?.[0]?.name || `Bruker ${post.author}`

  return {
    date: new Date(post.date).toISOString(),
    authorName,
    content,
    source: 'imported',
  }
}

export async function importVaktbokPosts(payload: Payload, posts: WpVaktbokPost[]): Promise<number> {
  let created = 0
  for (const post of posts) {
    const entry = parseWpPost(post)
    if (!entry) continue
    await payload.create({ collection: 'camera-log-entries', data: entry })
    created += 1
  }
  return created
}
