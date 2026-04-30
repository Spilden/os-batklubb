'use client'

import { useState } from 'react'
import { BaseCalendar } from './BaseCalendar'
import { SlippBookingModal } from '@/components/modals/SlippBookingModal'
import { bookSlot, cancelSlot } from '@/app/(frontend)/members/actions'
import type { SlippSlot, User } from '@/payload-types'
import { useRouter } from 'next/navigation'

type Action = { mode: 'book' | 'cancel'; slot: SlippSlot } | null

type Props = {
  currentUser: User
  initialSlots: SlippSlot[]
}

export function SlippCalendar({ currentUser, initialSlots }: Props) {
  const router = useRouter()
  const [action, setAction] = useState<Action>(null)

  const events = initialSlots.map(slot => ({
    id: String(slot.id),
    start: slot.startTime,
    end: slot.endTime,
    extendedProps: { slot },
  }))

  const book = async (comment: string) => {
    if (action?.mode !== 'book') return
    await bookSlot(action.slot.id, comment)
    setAction(null)
    router.refresh()
  }

  const cancel = async () => {
    if (action?.mode !== 'cancel') return
    await cancelSlot(action.slot.id)
    setAction(null)
    router.refresh()
  }

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleString('nb-NO', {
      weekday: 'long', day: 'numeric', month: 'long',
      hour: '2-digit', minute: '2-digit',
    })

  const bookedById = (slot: SlippSlot) =>
    typeof slot.bookedBy === 'object' ? slot.bookedBy?.id : slot.bookedBy

  const bookedByName = (slot: SlippSlot) =>
    typeof slot.bookedBy === 'object' && slot.bookedBy
      ? slot.bookedBy.name || slot.bookedBy.email
      : null


  return (
    <>
      <BaseCalendar
        events={events}
        eventClick={(arg: any) => {
          const slot: SlippSlot = arg.event.extendedProps.slot
          const isMine = bookedById(slot) === currentUser.id
          if (isMine) setAction({ mode: 'cancel', slot })
          else if (!slot.bookedBy) setAction({ mode: 'book', slot })
        }}
        eventContent={(info: any) => {
          const slot: SlippSlot = info.event.extendedProps.slot
          const isMine = bookedById(slot) === currentUser.id
          const color = isMine ? 'bg-ocean text-surface'
            : slot.bookedBy ? 'bg-border text-text'
              : 'bg-sage text-text'
          const label = isMine ? 'Din booking'
            : bookedByName(slot) || (slot.bookedBy ? 'Booket' : 'Ledig')

          return (
            <div className={`${color} rounded-md px-2 py-1 text-xs h-full overflow-hidden cursor-pointer`}>
              <div className="font-semibold">{info.timeText}</div>
              <div className="truncate">{label}</div>
            </div>
          )
        }}
      />

      {action?.mode === 'book' && (
        <SlippBookingModal
          title="Book slipp"
          info={formatTime(action.slot.startTime)}
          confirmLabel="Bekreft booking"
          onConfirm={book}
          onCancel={() => setAction(null)}
        />
      )}

      {action?.mode === 'cancel' && (
        <SlippBookingModal
          title="Avbestill booking"
          info={
            <>
              <p>Vil du avbestille denne bookingen?</p>
              <p className="mt-2 font-medium">{formatTime(action.slot.startTime)}</p>
            </>
          }
          confirmLabel="Avbestill"
          showComment={false}
          onConfirm={cancel}
          onCancel={() => setAction(null)}
        />
      )}
    </>
  )
}