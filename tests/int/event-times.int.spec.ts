import { describe, it, expect } from 'vitest'
import {
  defaultEndFor,
  joinDateTime,
  splitDateTime,
  timeOptions,
  toISO,
  toLocalInput,
} from '@/lib/admin/eventTimes'

describe('event time helpers', () => {
  it('defaultEndFor gives start + 2 hours', () => {
    expect(defaultEndFor('2099-05-01T18:00')).toBe('2099-05-01T20:00')
  })

  it('defaultEndFor rolls over midnight', () => {
    expect(defaultEndFor('2099-05-01T23:30')).toBe('2099-05-02T01:30')
  })

  it('toLocalInput and toISO round-trip', () => {
    expect(toLocalInput(toISO('2099-05-01T18:00'))).toBe('2099-05-01T18:00')
  })

  it('toISO returns empty string for empty or invalid input', () => {
    expect(toISO('')).toBe('')
    expect(toISO('tull')).toBe('')
  })
})

describe('24-hour time helpers', () => {
  it('timeOptions gives quarter hours in 24-hour format', () => {
    const opts = timeOptions()
    expect(opts).toHaveLength(96)
    expect(opts[0]).toBe('00:00')
    expect(opts).toContain('18:00')
    expect(opts.at(-1)).toBe('23:45')
    expect(opts.some((o) => /am|pm/i.test(o))).toBe(false)
  })

  it('timeOptions keeps an existing off-grid time, in order', () => {
    const opts = timeOptions('18:10')
    expect(opts).toHaveLength(97)
    expect(opts.indexOf('18:10')).toBe(opts.indexOf('18:00') + 1)
  })

  it('splitDateTime and joinDateTime round-trip', () => {
    expect(splitDateTime('2099-05-01T18:30')).toEqual({ date: '2099-05-01', time: '18:30' })
    expect(splitDateTime('')).toEqual({ date: '', time: '' })
    expect(joinDateTime('2099-05-01', '18:30')).toBe('2099-05-01T18:30')
    expect(joinDateTime('', '18:30')).toBe('')
    expect(joinDateTime('2099-05-01', '')).toBe('')
  })
})
