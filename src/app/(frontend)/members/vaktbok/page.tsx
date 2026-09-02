import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { VaktbokForm } from '@/components/VaktbokForm'
import { VaktbokList } from '@/components/VaktbokList'
import BaseButton from '@/components/BaseButton'
import { BaseMemberCard } from '@/components/BaseMemberCard'

const DAYS_IN_DEFAULT_VIEW = 30
const PAGE_SIZE = 20

export default async function VaktbokPage({
  searchParams,
}: {
  searchParams: Promise<{ history?: string; page?: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const { history: historyParam, page: pageParam } = await searchParams
  const isHistoryView = historyParam !== undefined
  const page = pageParam ? Number(pageParam) : 1

  const result = isHistoryView
    ? await payload.find({
        collection: 'camera-log-entries',
        sort: '-date',
        limit: PAGE_SIZE,
        page,
        depth: 0,
      })
    : await payload.find({
        collection: 'camera-log-entries',
        sort: '-date',
        limit: PAGE_SIZE,
        depth: 0,
        where: {
          date: {
            greater_than_equal: new Date(
              Date.now() - DAYS_IN_DEFAULT_VIEW * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        },
      })

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Kameravaktbok</h1>
      <div className="w-full flex flex-col gap-8">
        {user.roles?.includes('admin') && (
          <div className="flex justify-end">
            <BaseButton href="/members/vaktbok/oversikt" variant="text">
              Admin-oversikt
            </BaseButton>
          </div>
        )}
        <BaseMemberCard title="Rapport" content={<VaktbokForm />} />
        <BaseMemberCard
          title={isHistoryView ? 'Historikk' : `Siste ${DAYS_IN_DEFAULT_VIEW} dager`}
          content={
            <div className="flex flex-col gap-4">
              <VaktbokList entries={result.docs} currentUserId={user.id} />
              <div className="flex justify-center gap-4">
                {isHistoryView && result.hasPrevPage && (
                  <BaseButton href={`/members/vaktbok?history=1&page=${page - 1}`} variant="text">
                    Forrige
                  </BaseButton>
                )}
                {!isHistoryView && (
                  <BaseButton href="/members/vaktbok?history=1&page=1" variant="text">
                    Vis eldre
                  </BaseButton>
                )}
                {isHistoryView && result.hasNextPage && (
                  <BaseButton href={`/members/vaktbok?history=1&page=${page + 1}`} variant="text">
                    Neste
                  </BaseButton>
                )}
              </div>
            </div>
          }
        />
      </div>
    </>
  )
}
