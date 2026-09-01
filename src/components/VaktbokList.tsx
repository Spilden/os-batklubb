import type { CameraLogEntry } from '@/payload-types'
import { VaktbokEntry } from '@/components/VaktbokEntry'

export function VaktbokList({
  entries,
  currentUserId,
}: {
  entries: CameraLogEntry[]
  currentUserId: number
}) {
  if (entries.length === 0) {
    return <p className="text-text-muted">Ingen rapporter funnet.</p>
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => (
        <VaktbokEntry key={entry.id} entry={entry} canEdit={entry.user === currentUserId} />
      ))}
    </ul>
  )
}
