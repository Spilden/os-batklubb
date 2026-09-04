import React from 'react'

type BookingNoticeProps = {
  title?: string
  description: string
  testNotice?: string
}

export default function BookingNotice({
  title = 'Digital booking er under utvikling',
  description,
  testNotice = 'Du er velkommen til å prøve ut bookingfunksjonen i kalenderen for å gjøre deg kjent med systemet, men innsendte bestillinger regnes foreløpig kun som test.',
}: BookingNoticeProps) {
  return (
    <div className="w-full max-w-4xl mx-auto mb-6 bg-surface border border-sand/60 rounded-xl p-5 shadow-sm">
      <div className="flex items-start gap-3.5">
        <div className="p-2 rounded-lg bg-sand/20 text-ocean shrink-0 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h2 className="text-base font-bold text-text">{title}</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sand/30 text-text-muted border border-border">
              Under utvikling
            </span>
          </div>
          <p className="text-sm text-text-muted leading-relaxed mb-2.5">{description}</p>
          {testNotice && (
            <div className="text-xs font-medium text-ocean bg-ocean/5 border border-ocean/15 rounded-lg px-3 py-2 leading-relaxed flex items-start gap-1.5">
              <span className="shrink-0">💡</span>
              <span>
                <strong className="font-semibold text-text">Prøv gjerne funksjonen:</strong> {testNotice}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
