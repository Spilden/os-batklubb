import { JSDOM } from 'jsdom'
import crypto from 'crypto'

export type ContentBlock = { kind: 'text'; text: string } | { kind: 'image' }

// The source HTML only ever contains simple blocks (paragraphs, lists, image
// wrappers) - see migration_data/varganytt_nyheter*.json. Formatting like bold/links
// is dropped; this is a historical archive import, not a live editor round-trip.
export function parseContentBlocks(html: string): ContentBlock[] {
  const dom = new JSDOM(`<body>${html}</body>`)
  const body = dom.window.document.body
  const blocks: ContentBlock[] = []

  for (const child of Array.from(body.children)) {
    if (child.querySelector('img')) {
      blocks.push({ kind: 'image' })
      continue
    }
    const text = (child.textContent || '').replace(/\s+/g, ' ').trim()
    if (text) {
      blocks.push({ kind: 'text', text })
    }
  }

  return blocks
}

function textNode(text: string) {
  return { type: 'text', text, detail: 0, format: 0, mode: 'normal' as const, style: '', version: 1 }
}

function paragraphNode(text: string) {
  return {
    type: 'paragraph',
    children: [textNode(text)],
    direction: 'ltr' as const,
    format: '' as const,
    indent: 0,
    version: 1,
  }
}

function uploadNode(mediaId: number) {
  return {
    type: 'upload',
    version: 1,
    format: '' as const,
    relationTo: 'media' as const,
    value: mediaId,
    fields: {},
    id: crypto.randomUUID(),
  }
}

// Only the first image block gets embedded (there's at most one, since the
// caller already dropped every image after the first). Any further image
// blocks are silently skipped.
type LexicalNode = { type: string; version: number; [k: string]: unknown }

export function buildLexicalContent(blocks: ContentBlock[], imageMediaId: number | null) {
  const children: LexicalNode[] = []
  let imageInserted = false

  for (const block of blocks) {
    if (block.kind === 'image') {
      if (!imageInserted && imageMediaId !== null) {
        children.push(uploadNode(imageMediaId))
        imageInserted = true
      }
      continue
    }
    children.push(paragraphNode(block.text))
  }

  if (children.length === 0) {
    children.push(paragraphNode(''))
  }

  return {
    root: {
      type: 'root',
      children,
      direction: 'ltr' as const,
      format: '' as const,
      indent: 0,
      version: 1,
    },
  }
}
