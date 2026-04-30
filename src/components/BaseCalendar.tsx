'use client'

import FullCalendar from '@fullcalendar/react'
import timeGridPlugin from '@fullcalendar/timegrid'
import nbLocale from '@fullcalendar/core/locales/nb'

export function BaseCalendar(props: any) {
  return (
    <div className="max-w-4xl mx-auto p-8 bg-surface rounded-2xl shadow-[0_6px_32px_rgba(100,70,40,0.12)] border border-border">
      <FullCalendar
        plugins={[timeGridPlugin]}
        initialView="timeGridWeek"
        locale={nbLocale}
        firstDay={1}
        height="auto"
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        slotDuration="01:00:00"
        slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
        allDaySlot={false}
        nowIndicator={true}
        buttonText={{ today: 'I dag' }}
        {...props}
      />
    </div>
  )
}