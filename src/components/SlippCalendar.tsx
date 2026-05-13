'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { EventContentArg, DateSelectArg } from '@fullcalendar/core'
import { BaseCalendar } from './BaseCalendar'
import { SlippBookingModal } from '@/components/modals/SlippBookingModal'
import { createSlippRequest } from '@/app/(frontend)/members/slipp/actions'
import type { SlippBooking, SlippSetting, User } from '@/payload-types'

type Props = {
  currentUser: User
  initialRequests: SlippBooking[]
  settings: SlippSetting
}

type Selected = { start: Date; end: Date } | null

export function SlippCalendar({ currentUser, initialRequests, settings }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Selected>(null)
  const [error, setError] = useState<string | null>(null)
  const justClickedRef = useRef(false)

  const isLocked = (start: Date, end: Date) => {
    for (const season of settings.highSeasons ?? []) {
      const seasonStart = new Date(season.start)
      const seasonEnd = new Date(season.end)
      const seasonOpen = new Date(season.openDate)
      const now = new Date()

      const overlaps = start <= seasonEnd && end >= seasonStart
      if (!overlaps) continue

      if (now < seasonOpen) {
        return `Bookingen Åpner ${seasonOpen.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' })}`
      }

      if (now > seasonEnd) return 'Denne sesongen er over'
    }
    return null
  }

  const lockEvents = (settings.highSeasons ?? [])
    .filter((s) => new Date() < new Date(s.openDate) || new Date() > new Date(s.end))
    .map((s) => ({
      start: s.start,
      end: s.end,
      display: 'background',
      color: '#C9A87C',
    }))

  const events = [
    ...lockEvents,
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
    const lock = isLocked(arg.start, arg.end)
    if (lock) {
      setError(lock)
      return
    }
    setError(null)
    setSelected({ start: arg.start, end: arg.end })
  }

  const handleSubmit = async (comment: string) => {
    if (!selected) return
    await createSlippRequest(selected.start.toISOString(), selected.end.toISOString(), comment)
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
          const { req, isMine } = info.event.extendedProps as { req: SlippBooking; isMine: boolean }
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
        <SlippBookingModal
          title="Send slipp-forespørsel"
          info={`${formatTime(selected.start)} – ${formatTime(selected.end)}`}
          confirmLabel="Send forespørsel"
          onConfirmAction={handleSubmit}
          onCancelAction={() => setSelected(null)}
        />
      )}
    </>
  )
}
