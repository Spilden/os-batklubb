'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitVaktbokEntry } from '@/app/(frontend)/members/vaktbok/actions'
import BaseButton from '@/components/BaseButton'
import { VaktbokInstructionsModal } from '@/components/modals/VaktbokInstructionsModal'

const initialState = {
  success: false,
  error: '',
}

export function VaktbokForm() {
  const [state, action, isPending] = useActionState(submitVaktbokEntry, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    if (isPending) {
      setShowToast(null)
    }
    if (state.success) {
      formRef.current?.reset()
      setShowToast({ type: 'success', message: 'Rapport lagret, takk!' })
      setTimeout(() => setShowToast(null), 5000)
    }
    if (state.error) {
      setShowToast({ type: 'error', message: state.error })
      setTimeout(() => setShowToast(null), 5000)
    }
  }, [isPending, state.success, state.error])

  return (
    <>
      <form ref={formRef} action={action} className="flex flex-col gap-4">
        {showToast && (
          <div
            className={`fixed bottom-4 right-4 z-50 rounded-lg p-4 shadow-lg flex items-start gap-4 w-56
    ${
      showToast.type === 'success'
        ? 'bg-green-100 border border-green-500 text-green-700'
        : 'bg-red-100 border border-red-500 text-red-700'
    }`}
          >
            <span>{showToast.message}</span>
            <button
              type="button"
              onClick={() => setShowToast(null)}
              className="font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="flex justify-end">
          <BaseButton type="button" variant="text" onClick={() => setShowInstructions(true)}>
            Instruksjoner
          </BaseButton>
        </div>

        <div className="flex flex-col gap-1">
          <textarea
            id="content"
            name="content"
            aria-label="Rapport"
            required
            rows={4}
            placeholder="Alt i orden"
            className="border border-ocean rounded-lg p-2 bg-background text-text focus:outline-none focus:ring-2 focus:ring-ocean resize-none"
          />
        </div>

        <div className="flex justify-end">
          <BaseButton type="submit" disabled={isPending}>
            {isPending ? 'Lagrer...' : 'Lagre rapport'}
          </BaseButton>
        </div>
      </form>

      {showInstructions && (
        <VaktbokInstructionsModal onCloseAction={() => setShowInstructions(false)} />
      )}
    </>
  )
}
