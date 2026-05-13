import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import {getWind, getTidevann} from '@/app/(frontend)/members/actions'
import { BaseMemberCard } from '@/components/BaseMemberCard'

export default async function MembersPage() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) redirect('/admin/login')
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
  if(!vind) return <p>Kunne ikke hente vindinformasjon</p>
  if(!tidevann) return <p>Kunne ikke hente tidevannet</p>

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
                <WindArrow/>
              </div>
            }
            footer={vind.obsTimeLocal.slice(5, 16).replace('-', '/')}
          />
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <BaseMemberCard title="Mine Reservasjoner" content={showReservations()}/>
          <BaseMemberCard title="Min Båt" content="innhold" footer="footer" />
          <BaseMemberCard title="Min Bruker" content="innhold" footer="footer" />
          <BaseMemberCard title="Eventkalender" content="innhold" footer="footer" />
        </div>
      </div>
    </div>
  )
}


