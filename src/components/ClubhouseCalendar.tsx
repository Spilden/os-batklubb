'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BaseCalendar } from './BaseCalendar'
import { BookingModal } from './modals/BookingModal'
import type { ClubhouseBooking, User } from '@/payload-types'
import { createClubhouseBookingRequest } from '@/app/(frontend)/members/clubhouse/actions'

type Props = {
  currentUser: User
  initialRequests: ClubhouseBooking[]
}

type Selected = { start: Date; end: Date } | null

export function ClubhouseCalendar({ currentUser, initialRequests }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Selected>(null)
  const [error, setError] = useState<string | null>(null)
  const events = initialRequests.map((req) => {
    const isMine =
      typeof req.user === 'object' ? req.user.id === currentUser.id : req.user === currentUser.id
    return {
      id: String(req.id),
      start: req.startTime,
      end: req.endTime,
      extendedProps: { req, isMine },
    }
  })

  const handleSelect = (start: Date, end: Date) => {
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
    await createClubhouseBookingRequest(
      selected.start.toISOString(),
      selected.end.toISOString(),
      comment,
    )
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
