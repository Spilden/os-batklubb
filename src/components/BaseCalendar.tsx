'use client'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import nbLocale from '@fullcalendar/core/locales/nb'
import type { CalendarOptions } from '@fullcalendar/core'

export function BaseCalendar(props: CalendarOptions) {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8 bg-surface rounded-2xl shadow-[0_6px_32px_rgba(100,70,40,0.12)] border border-border">
      <FullCalendar
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'dayGridMonth,timeGridWeek',
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
        {...props}
      />
    </div>
  )
}
