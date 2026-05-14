'use client'

import { useState } from 'react'
import { BaseModal } from '@/components/modals/BaseModal'
import BaseButton from '@/components/BaseButton'

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
          <BaseButton
            onClick={onCancelAction}
            variant="secondary"
          >
            Avbryt
          </BaseButton>
          <BaseButton
            onClick={() => onConfirmAction(comment)}
            variant="primary"
          >
            {confirmLabel}
          </BaseButton>
        </div>
    </BaseModal>)
}
