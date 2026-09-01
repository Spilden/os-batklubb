import { describe, it, expect } from 'vitest'
import { stripHtml, guessPeriod, buildReportText } from '@/scripts/vaktbok-import-helpers'

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
})

describe('guessPeriod', () => {
  it('detects morgen', () => {
    expect(guessPeriod('TIRSDAG MORGEN 01.09.26')).toBe('morgen')
  })

  it('detects formiddag as morgen', () => {
    expect(guessPeriod('Formiddagsrunde 01.09.26')).toBe('morgen')
  })

  it('detects ettermiddag', () => {
    expect(guessPeriod('ettermiddag tirsdag 01.09.26')).toBe('ettermiddag')
  })

  it('detects a standalone "dag" as ettermiddag', () => {
    expect(guessPeriod('vakt dag.')).toBe('ettermiddag')
  })

  it('prefers ettermiddag over the standalone-dag fallback', () => {
    expect(guessPeriod('mandag ettermiddag. 31.08.26')).toBe('ettermiddag')
  })

  it('detects kveld', () => {
    expect(guessPeriod('Kveld 30.')).toBe('kveld')
  })

  it('detects natt as kveld', () => {
    expect(guessPeriod('Nattevakt 01.09.26')).toBe('kveld')
  })

  it('returns undefined when no keyword matches', () => {
    expect(guessPeriod('stille rolig')).toBeUndefined()
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
