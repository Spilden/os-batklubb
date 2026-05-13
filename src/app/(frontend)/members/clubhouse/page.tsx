import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { ClubhouseCalendar } from '@/components/ClubhouseCalendar'


export default async function ClubhousePage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')

  const [{ docs: requests }] = await Promise.all([
    payload.find({ collection: 'clubhouse-bookings', limit: 200, depth: 1 }),
  ])

  return (
    <>
      <h1 className="text-text font-display text-center text-3xl p-10">Booking av klubbhuset</h1>
      <ClubhouseCalendar currentUser={user} initialRequests={requests}/>
      <p className="text-text text-center text-xl p-10">
        Klikk på dagen du vil booke eller dra over de dagene/timene du ønsker å booke slipp.
      </p>
    </>
  )
}
