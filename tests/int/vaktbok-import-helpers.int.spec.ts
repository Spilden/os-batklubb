import { describe, it, expect } from 'vitest'
import { stripHtml, buildReportText } from '@/scripts/vaktbok-import-helpers'

describe('stripHtml', () => {
  it('removes tags and decodes common entities', () => {
    expect(
      stripHtml(
        '<p class="wp-block-paragraph">stille rolig. 2 biler parkering nede. Litt regn.&nbsp;</p>',
      ),
    ).toBe('stille rolig. 2 biler parkering nede. Litt regn.')
  })

  it('returns an empty string for empty input', () => {
    expect(stripHtml('')).toBe('')
  })

  it('decodes numeric entities and the named entities that actually occur in the migration data', () => {
    expect(stripHtml('Litt kaldt &#8211; alt i orden &raquo;ok&laquo;&#8230;')).toBe(
      'Litt kaldt – alt i orden »ok«…',
    )
  })
})

describe('buildReportText', () => {
  it('combines title and stripped content when content exists', () => {
    expect(buildReportText('ettermiddag tirsdag', '<p>stille rolig</p>')).toBe(
      'ettermiddag tirsdag\n\nstille rolig',
    )
  })

  it('falls back to the title alone when content is empty', () => {
    expect(buildReportText('vakt morgen', '')).toBe('vakt morgen')
  })
})
