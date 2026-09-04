import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const day = formatDate(dateString)
  const time = date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

export default async function VaktbokOversiktPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')
  if (!user.roles?.includes('admin')) redirect('/members/vaktbok')

  const { year: yearParam } = await searchParams
  const currentYear = new Date().getFullYear()
  const year = yearParam ? Number(yearParam) : currentYear

  const yearStart = new Date(year, 0, 1).toISOString()
  const yearEnd = new Date(year + 1, 0, 1).toISOString()

  const [{ docs }, { docs: members }] = await Promise.all([
    payload.find({
      collection: 'camera-log-entries',
      where: { date: { greater_than_equal: yearStart, less_than: yearEnd } },
      sort: '-date',
      limit: 0,
      depth: 0,
    }),
    payload.find({
      collection: 'users',
      where: { roles: { contains: 'kameravakt' } },
      limit: 0,
      depth: 0,
    }),
  ])

  const byAuthor = new Map<string, Array<{ date: string; content: string }>>()
  for (const doc of docs) {
    const entries = byAuthor.get(doc.authorName)
    const entry = { date: doc.date, content: doc.content }
    if (entries) {
      entries.push(entry)
    } else {
      byAuthor.set(doc.authorName, [entry])
    }
  }

  // Union of every kameravakt member's name (so people with zero reports still show
  // up, instead of just being absent from the list) and every authorName that
  // actually reported this year (so nobody who did report gets hidden just because
  // they don't have the kameravakt role, e.g. it hasn't been assigned to them yet).
  const allNames = new Set([...members.map((m) => m.name), ...byAuthor.keys()])

  const rows = [...allNames]
    .map((authorName) => ({ authorName, entries: byAuthor.get(authorName) ?? [] }))
    .sort((a, b) => a.entries.length - b.entries.length)

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">
        Vaktbok-oversikt {year}
      </h1>
      <div className="w-full flex flex-col gap-8">
        <div className="flex justify-start">
          <BaseButton href="/members/vaktbok" variant="text">
            Tilbake
          </BaseButton>
        </div>
        <div className="flex items-center justify-center gap-4">
          <BaseButton href={`/members/vaktbok/oversikt?year=${year - 1}`} variant="text">
            ◀ {year - 1}
          </BaseButton>
          <span className="text-text font-medium">{year}</span>
          <BaseButton href={`/members/vaktbok/oversikt?year=${year + 1}`} variant="text">
            {year + 1} ▶
          </BaseButton>
        </div>
        <BaseMemberCard
          title="Antall rapporter per person"
          content={
            rows.length === 0 ? (
              <p className="text-text-muted text-center p-10">
                Ingen medlemmer har rollen Kameravakt ennå.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-text-muted text-sm">
                  Klikk på en person for å se alle tidspunktene deres. Personer uten rapporter
                  vises øverst.
                </p>
                <div className="flex flex-col gap-2">
                  {rows.map((row) =>
                    row.entries.length === 0 ? (
                      <div
                        key={row.authorName}
                        className="flex justify-between border-b border-border/50 py-2"
                      >
                        <span className="text-text">{row.authorName}</span>
                        <span className="text-red-600 font-medium">Ingen rapporter</span>
                      </div>
                    ) : (
                      <details key={row.authorName} className="border-b border-border/50 py-2">
                        <summary className="flex justify-between cursor-pointer text-text">
                          <span>{row.authorName}</span>
                          <span className="text-text-muted">
                            {row.entries.length} rapport{row.entries.length === 1 ? '' : 'er'} ·
                            sist {formatDate(row.entries[0].date)}
                          </span>
                        </summary>
                        <ul className="pt-2 pl-4 text-sm flex flex-col gap-2">
                          {row.entries.map((entry, i) => (
                            <li key={i} className="flex gap-2 min-w-0">
                              <span className="text-text-muted whitespace-nowrap">
                                {formatDateTime(entry.date)}
                              </span>
                              <span className="text-text-muted">—</span>
                              <span className="text-text truncate">{entry.content}</span>
                            </li>
                          ))}
                        </ul>
                      </details>
                    ),
                  )}
                </div>
              </div>
            )
          }
        />
      </div>
    </>
  )
}
