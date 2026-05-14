import { Event } from '@/payload-types'
import { BaseModal } from '@/components/modals/BaseModal'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('nb-NO', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function isSameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

function Row({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2 text-text">
      <span>{icon}</span>
      <span>{children}</span>
    </div>
  )
}

export function EventModal({ event, onCloseAction }: { event: Event; onCloseAction: () => void }) {
  return (
    <BaseModal onCloseAction={onCloseAction}>
        <div className="flex items-start justify-between mb-4">
          <div>
            {event.status === 'cancelled' && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-md bg-red-100 text-red-700 mb-1">
                Avlyst
              </span>
            )}
            <h2 className="text-xl font-semibold text-text">{event.title}</h2>
          </div>
          <button
            onClick={onCloseAction}
            className="ml-4 p-1.5 rounded-lg hover:bg-border/30 text-text-muted transition-colors"
            aria-label="Lukk"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2.5 text-sm mb-4">
          <Row icon="📅">
            {isSameDay(event.startTime, event.endTime)
              ? `${formatDate(event.startTime)}, ${formatTime(event.startTime)}–${formatTime(event.endTime)}`
              : `${formatDate(event.startTime)} – ${formatDate(event.endTime)}`}
          </Row>
        </div>

        <p className="text-sm text-text-muted leading-relaxed">{event.description}</p>

        {event.comment && (
          <div className="mt-4 p-3 bg-sand/40 rounded-xl text-sm text-text-muted">
            <span className="font-medium text-text">Kommentar: </span>
            {event.comment}
          </div>
        )}
    </BaseModal>
  )
}
