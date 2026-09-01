import type { CameraLogEntry } from '@/payload-types'

const PERIOD_LABELS: Record<string, string> = {
  morgen: 'Morgen',
  ettermiddag: 'Ettermiddag',
  kveld: 'Kveld',
}

function formatEntryDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const time = date.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

export function VaktbokList({ entries }: { entries: CameraLogEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-text-muted">Ingen rapporter funnet.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <li key={entry.id} className="bg-surface rounded-xl p-4 shadow-sm">
          <div className="flex justify-between text-text-muted text-sm uppercase">
            <span>{entry.authorName}</span>
            <span>
              {formatEntryDate(entry.date)}
              {entry.period ? ` · ${PERIOD_LABELS[entry.period]}` : ''}
            </span>
          </div>
          <p className="text-text whitespace-pre-line pt-2">{entry.content}</p>
        </li>
      ))}
    </ul>
  )
}
