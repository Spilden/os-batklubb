'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EventContentArg, DateSelectArg } from '@fullcalendar/core'
import { BaseCalendar } from './BaseCalendar'
import { BookingModal } from './modals/BookingModal'
// import { createSlippRequest } from '@/app/(frontend)/members/slipp/actions'
import type { ClubhouseBooking, User } from '@/payload-types'
import { createClubhouseBookingRequest } from '@/app/(frontend)/members/clubhouse/actions'

type Props = {
  currentUser: User
  initialRequests: ClubhouseBooking[]
}

type Selected = { start: Date; end: Date } | null

export function ClubhouseCalendar({ currentUser, initialRequests}: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Selected>(null)
  const [error, setError] = useState<string | null>(null)
  const justClickedRef = useRef(false)



  const events = [
    ...initialRequests.map((req) => {
      const isMine =
        typeof req.user === 'object' ? req.user.id === currentUser.id : req.user === currentUser.id
      return {
        id: String(req.id),
        start: req.startTime,
        end: req.endTime,
        extendedProps: { req, isMine },
      }
    }),
  ]

  const handleSelect = (arg: DateSelectArg) => {
    setError(null)
    setSelected({ start: arg.start, end: arg.end })
  }

  const handleSubmit = async (comment: string) => {
    if (!selected) return
    await createClubhouseBookingRequest(selected.start.toISOString(), selected.end.toISOString(), comment)
    setSelected(null)
    router.refresh()
  }

  const formatTime = (date: Date) =>
    date.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <>
      {error && (
        <div className="max-w-4xl mx-auto mb-4 rounded-lg bg-apricot/40 border border-sand p-3 text-sm text-text">
          {error}
        </div>
      )}

      <BaseCalendar
        selectable
        dateClick={(arg) => {
          justClickedRef.current = true
          const start = arg.date
          const end = new Date(start)
          end.setDate(end.getDate() + 1)
          handleSelect({ start, end, allDay: true } as DateSelectArg)
          setTimeout(() => {
            justClickedRef.current = false
          }, 100)
        }}
        select={(arg) => {
          if (justClickedRef.current) return
          handleSelect(arg)
        }}
        events={events}
        eventContent={(info: EventContentArg) => {
          const { req, isMine } = info.event.extendedProps as { req: ClubhouseBooking; isMine: boolean }
          if (!req) return null

          const color = isMine
            ? req.status === 'approved'
              ? 'bg-ocean text-surface'
              : req.status === 'rejected'
                ? 'bg-border text-text line-through'
                : 'bg-sand text-text'
            : 'bg-border text-text'

          const label = isMine
            ? { pending: 'Venter', approved: 'Godkjent', rejected: 'Avslått' }[req.status as string]
            : typeof req.user === 'object'
              ? req.user.name || req.user.email
              : ''

          return (
            <div className={`${color} rounded-md px-2 py-1 text-xs h-full overflow-hidden`}>
              <div className="font-semibold truncate">{label}</div>
            </div>
          )
        }}
      />

      {selected && (
        <BookingModal
          title="Send klubbhus booking forespørsel"
          info={`${formatTime(selected.start)} – ${formatTime(selected.end)}`}
          confirmLabel="Send forespørsel"
          onConfirmAction={handleSubmit}
          onCancelAction={() => setSelected(null)}
        />
      )}
    </>
  )
}
