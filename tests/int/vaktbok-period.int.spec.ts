import { describe, it, expect } from 'vitest'
import { osloMidnight, resolvePeriod } from '@/lib/admin/vaktbokPeriod'

// 2026-11-09 12:00 Oslo (winter time, UTC+1)
const NOW = new Date('2026-11-09T11:00:00.000Z')

describe('osloMidnight', () => {
  it('handles winter time (UTC+1)', () => {
    expect(osloMidnight('2026-01-15')).toBe('2026-01-14T23:00:00.000Z')
  })
  it('handles summer time (UTC+2)', () => {
    expect(osloMidnight('2026-07-01')).toBe('2026-06-30T22:00:00.000Z')
  })
})

describe('resolvePeriod', () => {
  it('defaults to the current year', () => {
    const p = resolvePeriod({}, NOW)
    expect(p.fra).toBe('2026-01-01')
    expect(p.til).toBe('2026-12-31')
    expect(p.fromISO).toBe('2025-12-31T23:00:00.000Z')
    expect(p.toISO).toBe('2026-12-31T23:00:00.000Z') // exclusive: start of 2027-01-01 Oslo
  })

  it('uses fra/til and includes the whole til day', () => {
    const p = resolvePeriod({ fra: '2026-03-01', til: '2026-03-31' }, NOW)
    expect(p.fromISO).toBe('2026-02-28T23:00:00.000Z')
    expect(p.toISO).toBe('2026-03-31T22:00:00.000Z') // 2026-04-01 00:00 Oslo (summer time)
  })

  it('swaps fra and til when reversed', () => {
    const p = resolvePeriod({ fra: '2026-05-10', til: '2026-05-01' }, NOW)
    expect(p.fra).toBe('2026-05-01')
    expect(p.til).toBe('2026-05-10')
  })

  it('fills a missing side', () => {
    expect(resolvePeriod({ fra: '2026-06-01' }, NOW).til).toBe('2026-11-09')
    expect(resolvePeriod({ til: '2026-02-01' }, NOW).fra).toBe('2026-01-01')
  })

  it('ignores invalid dates', () => {
    const p = resolvePeriod({ fra: 'tull', til: '2026-13-45' }, NOW)
    expect(p.fra).toBe('2026-01-01')
    expect(p.til).toBe('2026-12-31')
  })

  it('supports the old year parameter', () => {
    const p = resolvePeriod({ year: '2024' }, NOW)
    expect(p.fra).toBe('2024-01-01')
    expect(p.til).toBe('2024-12-31')
  })

  it('offers presets', () => {
    const p = resolvePeriod({}, NOW)
    const byLabel = Object.fromEntries(p.presets.map((x) => [x.label, `${x.fra}..${x.til}`]))
    expect(byLabel['I år']).toBe('2026-01-01..2026-12-31')
    expect(byLabel['I fjor']).toBe('2025-01-01..2025-12-31')
    expect(byLabel['Siste 30 dager']).toBe('2026-10-11..2026-11-09')
    expect(byLabel['Siste 12 måneder']).toBe('2025-11-10..2026-11-09')
  })
})
