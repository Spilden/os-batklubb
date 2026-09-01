import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { VaktbokForm } from '@/components/VaktbokForm'
import { VaktbokList } from '@/components/VaktbokList'
import BaseButton from '@/components/BaseButton'

const DAYS_IN_DEFAULT_VIEW = 30
const PAGE_SIZE = 20

export default async function VaktbokPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const { page: pageParam } = await searchParams
  const page = pageParam ? Number(pageParam) : 1
  const isPaginatedView = page > 1

  const result = isPaginatedView
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
        limit: 50,
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
    <div className="w-full flex flex-col gap-8">
      <h1 className="text-text font-display text-center text-3xl p-10">Kameravaktbok</h1>
      <VaktbokForm />
      <div className="flex flex-col gap-4">
        <h2 className="text-text font-display text-xl">
          {isPaginatedView ? 'Historikk' : `Siste ${DAYS_IN_DEFAULT_VIEW} dager`}
        </h2>
        <VaktbokList entries={result.docs} />
        <div className="flex justify-center gap-4">
          {isPaginatedView && result.hasPrevPage && (
            <BaseButton href={`/members/vaktbok?page=${page - 1}`} variant="text">
              Forrige
            </BaseButton>
          )}
          {!isPaginatedView && (
            <BaseButton href="/members/vaktbok?page=2" variant="text">
              Vis eldre
            </BaseButton>
          )}
          {isPaginatedView && result.hasNextPage && (
            <BaseButton href={`/members/vaktbok?page=${page + 1}`} variant="text">
              Neste
            </BaseButton>
          )}
        </div>
      </div>
    </div>
  )
}
