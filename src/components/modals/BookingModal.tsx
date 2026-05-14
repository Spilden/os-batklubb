'use client'

import { useState, useRef } from 'react'
import { BaseModal } from '@/components/modals/BaseModal'

type Props = {
  title: string
  info: React.ReactNode
  confirmLabel?: string
  showComment?: boolean
  onConfirmAction: (comment: string) => void
  onCancelAction: () => void
}

export function BookingModal({
  title,
  info,
  confirmLabel = 'Bekreft',
  showComment = true,
  onConfirmAction,
  onCancelAction,
}: Props) {
  const [comment, setComment] = useState('')
  const downOnOverlay = useRef(false)

  return (
    <BaseModal onCloseAction={onCancelAction}>
        <h2 className="font-display mb-4 text-xl font-semibold text-text">{title}</h2>
        <div className="mb-4 text-sm text-text">{info}</div>

        {showComment && (
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kommentar (valgfri)"
            rows={3}
            className="w-full mb-4 rounded-lg border border-border bg-background px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
          />
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancelAction}
            className="rounded-lg border border-border px-4 py-2 text-sm text-text hover:bg-background"
          >
            Avbryt
          </button>
          <button
            onClick={() => onConfirmAction(comment)}
            className="rounded-lg bg-primary px-4 py-2 text-sm text-surface hover:bg-primary-light"
          >
            {confirmLabel}
          </button>
        </div>
    </BaseModal>)
}
