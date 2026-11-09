import { getAdminContext } from '@/lib/admin/getAdminContext'
import { buildVaktbokOverview } from '@/lib/admin/vaktbokOverview'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import BaseButton from '@/components/BaseButton'
import { VaktbokOverviewList, type VaktbokRow } from '@/components/admin/VaktbokOverviewList'
import { PeriodPicker } from '@/components/admin/PeriodPicker'
import { resolvePeriod, type PeriodParams } from '@/lib/admin/vaktbokPeriod'

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('nb-NO', {
    timeZone: 'Europe/Oslo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  const day = formatDate(dateString)
  const time = date.toLocaleTimeString('nb-NO', {
    timeZone: 'Europe/Oslo',
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${day} ${time}`
}

function formatDay(date: string): string {
  // YYYY-MM-DD is a calendar day; format it in UTC so it never shifts a day.
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('nb-NO', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function VaktbokOversiktPage({
  searchParams,
}: {
  searchParams: Promise<PeriodParams>
}) {
  const { payload, admin } = await getAdminContext()
  const period = resolvePeriod(await searchParams)

  const overview = await buildVaktbokOverview(payload, admin, period)
  const rows: VaktbokRow[] = overview.map((row) => ({
    key: row.key,
    name: row.name,
    count: row.entries.length,
    last: row.entries[0]?.date ?? null,
    lastLabel: row.entries[0] ? formatDate(row.entries[0].date) : null,
    entries: row.entries.map((e) => ({ label: formatDateTime(e.date), content: e.content })),
  }))
  const total = rows.reduce((sum, row) => sum + row.count, 0)

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl pt-10 pb-2">Vaktbok-oversikt</h1>
      <p className="text-text-muted text-center pb-8">
        {formatDay(period.fra)} – {formatDay(period.til)}
      </p>
      <div className="w-full flex flex-col gap-8">
        <div className="flex justify-start">
          <BaseButton href="/members/admin" variant="text">
            Tilbake
          </BaseButton>
        </div>
        <PeriodPicker period={period} basePath="/members/admin/vaktbok" />
        <BaseMemberCard
          title={`${total} rapporter i perioden`}
          content={
            rows.length === 0 ? (
              <p className="text-text-muted text-center p-10">
                Ingen kameravakter eller rapporter i denne perioden.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="text-text-muted text-sm">
                  Klikk på en person for å se alle tidspunktene deres. Trykk på en overskrift for å
                  sortere.
                </p>
                <VaktbokOverviewList rows={rows} />
              </div>
            )
          }
        />
      </div>
    </>
  )
}
