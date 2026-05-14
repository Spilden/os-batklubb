'use client'
import { useState, useEffect } from 'react'
import { BaseCalendar } from '@/components/BaseCalendar'
import type { EventInput } from '@fullcalendar/core'
import type { Event } from '@/payload-types'
import { EventModal } from '@/components/modals/EventModal'

type SelectedEvent = Event | null

export function EventCalendar() {
  const [events, setEvents] = useState<EventInput[]>([])
  const [rawEvents, setRawEvents] = useState<Record<string, Event>>({})
  const [selected, setSelected] = useState<SelectedEvent>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events?limit=200&where[status][not_equals]=draft')
        const data = await res.json()
        const docs: Event[] = data.docs ?? []

        const byId: Record<string, Event> = {}
        const calEvents: EventInput[] = docs.map((doc) => {
          byId[String(doc.id)] = doc
          return {
            id: String(doc.id),
            title: doc.title,
            start: doc.startTime,
            end: doc.endTime,
            backgroundColor: 'transparent',
            borderColor: 'transparent',
            classNames: doc.status === 'cancelled' ? ['line-through', 'opacity-60'] : [],
            extendedProps: {
              color: doc.color ?? '#378ADD',
            },
          }
        })

        setRawEvents(byId)
        setEvents(calEvents)
      } catch (err) {
        console.error('Klarte ikke hente events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents().catch(console.error)
  }, [])

  function handleEventClick(arg: { event: { id: string } }) {
    const event = rawEvents[arg.event.id]
    if (event) setSelected(event)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-text-muted text-sm">
        Laster kalender…
      </div>
    )
  }

  return (
    <>
      <BaseCalendar
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'today',
          center: 'title',
          right: 'prev,next',
        }}
      />
      {selected && <EventModal event={selected} onCloseAction={() => setSelected(null)} />}
    </>
  )
}
