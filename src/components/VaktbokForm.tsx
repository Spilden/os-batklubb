'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitVaktbokEntry } from '@/app/(frontend)/members/vaktbok/actions'
import BaseButton from '@/components/BaseButton'

const initialState = {
  success: false,
  error: '',
}

const PERIODS: Array<{ value: string; label: string }> = [
  { value: 'morgen', label: 'Morgen' },
  { value: 'ettermiddag', label: 'Ettermiddag' },
  { value: 'kveld', label: 'Kveld' },
]

function guessCurrentPeriod(): string {
  const hour = new Date().getHours()
  if (hour < 11) return 'morgen'
  if (hour < 18) return 'ettermiddag'
  return 'kveld'
}

export function VaktbokForm() {
  const [state, action, isPending] = useActionState(submitVaktbokEntry, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [period, setPeriod] = useState(guessCurrentPeriod())
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  useEffect(() => {
    if (isPending) {
      setShowToast(null)
    }
    if (state.success) {
      formRef.current?.reset()
      setPeriod(guessCurrentPeriod())
      setShowToast({ type: 'success', message: 'Rapport lagret, takk!' })
      setTimeout(() => setShowToast(null), 5000)
    }
    if (state.error) {
      setShowToast({ type: 'error', message: state.error })
      setTimeout(() => setShowToast(null), 5000)
    }
  }, [isPending, state.success, state.error])

  return (
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

      <div className="flex flex-col gap-2 text-text font-medium text-sm uppercase">
        <label>Periode</label>
        <div className="flex gap-3">
          {PERIODS.map((p) => (
            <label
              key={p.value}
              className="flex items-center gap-2 cursor-pointer border border-ocean rounded-lg px-4 py-2 has-checked:bg-ocean has-checked:text-surface transition-colors"
            >
              <input
                type="radio"
                name="period"
                value={p.value}
                checked={period === p.value}
                onChange={() => setPeriod(p.value)}
                className="sr-only"
              />
              {p.label}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="content" className="text-text font-medium text-sm uppercase">
          Rapport
        </label>
        <textarea
          id="content"
          name="content"
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
  )
}
