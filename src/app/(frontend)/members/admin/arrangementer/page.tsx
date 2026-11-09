import Link from 'next/link'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'
import { EVENT_STATUS_LABELS, listEvents, type EventStatus } from '@/lib/admin/events'
import { getAdminContext } from '@/lib/admin/getAdminContext'

function formatRange(start: string, end: string) {
  const opts: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Oslo' }
  const date = (d: string) =>
    new Date(d).toLocaleDateString('nb-NO', { ...opts, weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
  const time = (d: string) =>
    new Date(d).toLocaleTimeString('nb-NO', { ...opts, hour: '2-digit', minute: '2-digit' })
  const sameDay = date(start) === date(end)
  return sameDay
    ? `${date(start)} kl. ${time(start)}–${time(end)}`
    : `${date(start)} kl. ${time(start)} – ${date(end)} kl. ${time(end)}`
}

const statusClass: Record<EventStatus, string> = {
  draft: 'bg-sand/30 text-text-muted border-border',
  published: 'bg-green-100 text-green-700 border-green-300',
  cancelled: 'bg-red-100 text-red-700 border-red-300',
}

export default async function EventsAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ tidligere?: string }>
}) {
  const { payload, admin } = await getAdminContext()
  const past = (await searchParams).tidligere === '1'
  const events = await listEvents(payload, admin, { past })

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Arrangementer</h1>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap justify-between gap-4">
          <BaseButton href="/members/admin" variant="text">
            Tilbake
          </BaseButton>
          <BaseButton href="/members/admin/arrangementer/ny">Nytt arrangement</BaseButton>
        </div>
        <div className="flex gap-4 justify-center">
          <BaseButton href="/members/admin/arrangementer" variant="text" active={!past}>
            Kommende
          </BaseButton>
          <BaseButton href="/members/admin/arrangementer?tidligere=1" variant="text" active={past}>
            Tidligere
          </BaseButton>
        </div>
        <BaseMemberCard>
          {events.length === 0 ? (
            <p className="text-text-muted text-center p-10">
              {past ? 'Ingen tidligere arrangementer.' : 'Ingen kommende arrangementer.'}
            </p>
          ) : (
            <ul className="flex flex-col">
              {events.map((e) => {
                const status = (e.status ?? 'draft') as EventStatus
                return (
                  <li key={e.id} className="border-b border-border/50">
                    <Link
                      href={`/members/admin/arrangementer/${e.id}`}
                      className="flex items-center gap-3 py-3 hover:bg-background/60 rounded"
                    >
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: e.color || '#1e40af' }}
                      />
                      <span className="flex-1 min-w-0">
                        <span className={`block text-text font-medium ${status === 'cancelled' ? 'line-through' : ''}`}>
                          {e.title}
                        </span>
                        <span className="block text-text-muted text-sm">{formatRange(e.startTime, e.endTime)}</span>
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${statusClass[status]}`}>
                        {EVENT_STATUS_LABELS[status]}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </BaseMemberCard>
      </div>
    </>
  )
}
