'use client'

import { useActionState, useEffect, useState } from 'react'
import { editVaktbokEntry } from '@/app/(frontend)/members/vaktbok/actions'
import BaseButton from '@/components/BaseButton'
import type { CameraLogEntry } from '@/payload-types'

const initialState = {
  success: false,
  error: '',
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

export function VaktbokEntry({ entry, canEdit }: { entry: CameraLogEntry; canEdit: boolean }) {
  const [isEditing, setIsEditing] = useState(false)
  const [state, action, isPending] = useActionState(editVaktbokEntry, initialState)

  useEffect(() => {
    if (state.success) {
      setIsEditing(false)
    }
  }, [state.success])

  return (
    <li className="bg-surface rounded-xl p-4 shadow-sm">
      <div className="flex justify-between text-text-muted text-sm uppercase">
        <span>{entry.authorName}</span>
        <span>{formatEntryDate(entry.date)}</span>
      </div>

      {isEditing ? (
        <form action={action} className="flex flex-col gap-2 pt-2">
          <input type="hidden" name="entryId" value={entry.id} />
          <textarea
            name="content"
            required
            rows={4}
            defaultValue={entry.content}
            className="border border-ocean rounded-lg p-2 bg-background text-text focus:outline-none focus:ring-2 focus:ring-ocean resize-none"
          />
          {state.error && <p className="text-red-700 text-sm">{state.error}</p>}
          <div className="flex justify-end gap-2">
            <BaseButton type="button" variant="text" onClick={() => setIsEditing(false)}>
              Avbryt
            </BaseButton>
            <BaseButton type="submit" disabled={isPending}>
              {isPending ? 'Lagrer...' : 'Lagre'}
            </BaseButton>
          </div>
        </form>
      ) : (
        <>
          <p className="text-text whitespace-pre-line pt-2">{entry.content}</p>
          {canEdit && (
            <div className="flex justify-end pt-2">
              <BaseButton type="button" variant="text" onClick={() => setIsEditing(true)}>
                Rediger
              </BaseButton>
            </div>
          )}
        </>
      )}
    </li>
  )
}
