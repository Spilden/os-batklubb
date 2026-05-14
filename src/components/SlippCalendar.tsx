'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BaseCalendar } from './BaseCalendar'
import { BookingModal } from './modals/BookingModal'
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
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        extendedProps: { req, isMine },
      }
    }),
  ]

  const handleSelect = (start: Date, end: Date) => {
    const lock = isLocked(start, end)
    if (lock) {
      setError(lock)
      return
    }

    const conflict = initialRequests.find((req) => {
      if (req.status !== 'approved') return false
      return start < new Date(req.endTime) && end > new Date(req.startTime)
    })

    if (conflict) {
      setError('Det er allerede en godkjent booking i denne perioden')
      return
    }

    setError(null)
    setSelected({ start, end })
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

      <BaseCalendar bookable onDateSelected={handleSelect} events={events} />

      {selected && (
        <BookingModal
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
