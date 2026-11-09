const TZ = 'Europe/Oslo'
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export type PeriodParams = { fra?: string; til?: string; year?: string }

export type Preset = { label: string; fra: string; til: string }

export type Period = {
  /** Inclusive dates as YYYY-MM-DD (Oslo calendar days). */
  fra: string
  til: string
  /** Query range: fromISO inclusive, toISO exclusive (start of the day after `til`). */
  fromISO: string
  toISO: string
  presets: Preset[]
}

function isValidDate(value?: string): value is string {
  const m = value ? DATE_RE.exec(value) : null
  if (!m) return false
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(Date.UTC(y, mo - 1, d))
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d
}

/** Offset of Oslo from UTC (ms) at the given instant. */
function osloOffset(instant: number): number {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(new Date(instant))
      .map((p) => [p.type, p.value]),
  )
  const asUTC = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  )
  return asUTC - instant
}

/** ISO instant of 00:00 Oslo time on the given YYYY-MM-DD. */
export function osloMidnight(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const guess = Date.UTC(y, m - 1, d)
  return new Date(guess - osloOffset(guess)).toISOString()
}

/** Today's date in Oslo as YYYY-MM-DD. */
function osloToday(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now)
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

function addYears(date: string, years: number): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y + years, m - 1, d)).toISOString().slice(0, 10)
}

export function resolvePeriod(params: PeriodParams, now: Date = new Date()): Period {
  const today = osloToday(now)
  const year = Number(today.slice(0, 4))

  const presets: Preset[] = [
    { label: 'I år', fra: `${year}-01-01`, til: `${year}-12-31` },
    { label: 'I fjor', fra: `${year - 1}-01-01`, til: `${year - 1}-12-31` },
    { label: 'Siste 30 dager', fra: addDays(today, -29), til: today },
    { label: 'Siste 12 måneder', fra: addDays(addYears(today, -1), 1), til: today },
  ]

  let fra: string
  let til: string
  const hasFra = isValidDate(params.fra)
  const hasTil = isValidDate(params.til)

  if (hasFra || hasTil) {
    til = hasTil ? params.til! : today
    fra = hasFra ? params.fra! : `${til.slice(0, 4)}-01-01`
  } else if (params.year && /^\d{4}$/.test(params.year)) {
    fra = `${params.year}-01-01`
    til = `${params.year}-12-31`
  } else {
    fra = presets[0].fra
    til = presets[0].til
  }

  if (fra > til) [fra, til] = [til, fra]

  return {
    fra,
    til,
    fromISO: osloMidnight(fra),
    toISO: osloMidnight(addDays(til, 1)),
    presets,
  }
}
