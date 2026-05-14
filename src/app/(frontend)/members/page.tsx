import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {getWind, getTidevann} from '@/utils/weather'
import { BaseMemberCard } from '@/components/BaseMemberCard'
import { EventCalendar } from '@/components/EventCalendar'
import WeatherWidget from '@/components/WeatherWidget'

export default async function MembersPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/')
  const [tidevann, vind] = await Promise.all([getTidevann(), getWind()])

  function WindArrow() {
    return (
      <div style={{ transform: `rotate(${vind.winddir}deg)` }} className="text-2xl">
        ↑
      </div>
    )
  }

  const currentTime = new Date()
  const nextTide = tidevann?.find((t) => t.tid > currentTime)
  const highLowWater = nextTide?.flag === 'high' ? 'høyvann' : 'lavvann'
  if (!vind) return <p>Kunne ikke hente vindinformasjon</p>
  if (!tidevann) return <p>Kunne ikke hente tidevannet</p>

  const now = new Date().toISOString()

  const slippResponse = await payload.find({
    collection: 'slipp-bookings',
    depth: 1,
    where: {
      and: [
        {
          user: {
            equals: user.id,
          },
        },
        {
          endTime: {
            greater_than_equal: now,
          },
        },
      ],
    },
  })

  /*const venueResponse = await payload.find({
    collection: 'venue-bookings',
    depth: 1,
    where: {
      and: [
        {
          user: {
            equals: user.id,
          },
        },
        {
          endTime: {
            greater_than_equal: now,
          }
        }
      ]
    }
  })*/

  // const venueReservations = venueResponse.docs
  const venueReservations = null // slett når data er kommet
  const slippReservations = slippResponse.docs

  const allReservations = [
    ...(slippReservations ?? []),
    ...(venueReservations ?? []),
  ].sort((a, b) => a.startTime.localeCompare(b.startTime))

  function formatDate(isoString: string) {
    const date = new Date(isoString).toLocaleDateString('nb-NO', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    })
    const time = new Date(isoString).toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
    })

    return `${date}  ${time}`
  }

  function showReservations() {
    return (
      <>
        <div className="grid grid-cols-4">
          <p className="">Reservasjon</p>
          <p className="">Status</p>
          <p className="">Fra</p>
          <p className="">Til</p>
        </div>
        {allReservations.map((reservation) => (
          <div key={reservation.id} className="grid grid-cols-4">
            <p>Slipp</p>
            <p>{reservation.status}</p>
            <p>{formatDate(reservation.startTime)}</p>
            <p>{formatDate(reservation.endTime)}</p>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className="w-full">
      <h1 className="font-display text-text text-3xl font-bold p-4 pb-16">Velkommen {user.name}</h1>
      <div className="w-full flex flex-col gap-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <BaseMemberCard title="Min Plass" content="A-32" footer="Brygge A" />
          <BaseMemberCard
            title={`Neste ${highLowWater}`}
            content={`${nextTide?.verdi} cm`}
            footer={`Klokken ${nextTide?.tid.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })}`}
          />
          <BaseMemberCard
            title="Vinden på kaia"
            content={
              <div className="flex items-center gap-4">
                <span>{vind.metric.windSpeed} m/s</span>
                <WindArrow />
              </div>
            }
            footer={vind.obsTimeLocal.slice(5, 16).replace('-', '/')}
          />
          <BaseMemberCard title="Været nå">
            <div className="flex justify-center">
              <WeatherWidget days={1} variant="compact" />
            </div>
          </BaseMemberCard>
        </div>
        <div className="grid xl:grid-cols-2 gap-4">
          <BaseMemberCard title="Mine Reservasjoner" content={showReservations()} />
          <BaseMemberCard title="Min Båt" content="innhold" footer="footer" />
          <BaseMemberCard title="Min Bruker" content="innhold" footer="footer" />
          <BaseMemberCard className="pl-4">
            <EventCalendar />
          </BaseMemberCard>
        </div>
      </div>
    </div>
  )
}
