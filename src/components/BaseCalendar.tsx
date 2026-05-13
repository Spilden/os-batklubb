'use client'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import nbLocale from '@fullcalendar/core/locales/nb'
import type { CalendarOptions, EventContentArg } from '@fullcalendar/core'
import { useRef } from 'react'

type Props = CalendarOptions & {
  bookable?: boolean
  onDateSelected?: (start: Date, end: Date) => void}

function renderEventContent(info: EventContentArg) {
  const { req, isMine } = info.event.extendedProps as {
    req: { status: string; user: { id: number; name?: string; email?: string } | number }
    isMine: boolean
  }
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
}

export function BaseCalendar({ bookable, onDateSelected, ...props }: Props) {
  const justClickedRef = useRef(false)

  const bookingProps: CalendarOptions = bookable
  ? {
      selectable: true,
      dateClick: (arg) => {
        justClickedRef.current = true
        const start = arg.date
        const end = new Date(start)
        end.setDate(end.getDate() + 1)
        onDateSelected?.(start, end)
        setTimeout(() => { justClickedRef.current = false }, 100)
      },
      select: (arg) => {
        if (justClickedRef.current) return
        onDateSelected?.(arg.start, arg.end)
      },
    } : {}



  const calendarProps = {
    eventContent: renderEventContent,
    ...bookingProps,
    ...props,
  }
  return (
    <>
      <div className="hidden lg:block max-w-4xl mx-auto p-4 lg:p-8 bg-surface rounded-2xl shadow-[0_6px_32px_rgba(100,70,40,0.12)] border border-border">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'dayGridMonth timeGridWeek',
            center: 'title',
            right: 'today prev,next',
          }}
          locale={nbLocale}
          firstDay={1}
          height="auto"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="02:00:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          allDaySlot={false}
          nowIndicator={false}
          buttonText={{ today: 'I dag', month: 'Måned', week: 'Uke' }}
          longPressDelay={200}
          selectMinDistance={5}
          {...calendarProps}
        />
      </div>

      <div className="lg:hidden block max-w-4xl mx-auto p-4 lg:p-8 bg-surface rounded-2xl shadow-[0_6px_32px_rgba(100,70,40,0.12)] border border-border">
        <FullCalendar
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: '',
            center: 'title',
            right: '',
          }}
          footerToolbar={{
            left: 'dayGridMonth,timeGridWeek',
            right: 'today prev,next',
          }}
          locale={nbLocale}
          firstDay={1}
          height="auto"
          slotMinTime="00:00:00"
          slotMaxTime="24:00:00"
          slotDuration="02:00:00"
          slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
          allDaySlot={false}
          nowIndicator={false}
          buttonText={{ today: 'I dag', month: 'Måned', week: 'Uke' }}
          longPressDelay={200}
          selectMinDistance={5}
          {...calendarProps}
        />
      </div>
    </>
  )
}
