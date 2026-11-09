const pad = (n: number) => String(n).padStart(2, '0')

function formatLocal(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** ISO string → value for <input type="datetime-local"> in the viewer's local time. */
export function toLocalInput(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : formatLocal(d)
}

/** datetime-local value (local time, no zone) → ISO string, so the server never guesses the zone. */
export function toISO(local: string): string {
  if (!local) return ''
  const d = new Date(local)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString()
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

/** Suggested end for a given start (datetime-local values): two hours later. */
export function defaultEndFor(startLocal: string): string {
  const d = new Date(startLocal)
  if (Number.isNaN(d.getTime())) return ''
  return formatLocal(new Date(d.getTime() + DEFAULT_DURATION_MS))
}

/** All quarter hours in 24-hour format ("00:00" … "23:45"), plus `current` if it is off the grid. */
export function timeOptions(current?: string): string[] {
  const options: string[] = []
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) options.push(`${pad(h)}:${pad(m)}`)
  }
  if (current && /^\d{2}:\d{2}$/.test(current) && !options.includes(current)) {
    options.push(current)
    options.sort()
  }
  return options
}

/** "YYYY-MM-DDTHH:MM" → { date, time } (empty strings if missing). */
export function splitDateTime(local: string): { date: string; time: string } {
  const [date = '', time = ''] = local ? local.split('T') : []
  return { date, time: time.slice(0, 5) }
}

/** { date, time } → "YYYY-MM-DDTHH:MM", or '' until both parts are set. */
export function joinDateTime(date: string, time: string): string {
  return date && time ? `${date}T${time}` : ''
}
