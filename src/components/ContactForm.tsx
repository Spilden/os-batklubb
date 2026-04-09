'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitContactForm } from '@/app/(frontend)/contact/actions'
import BaseButton from '@/components/BaseButton'

const initilalState = {
  success: false,
  error: '',
}

export default function ContactForm() {
  const [state, action, isPending] = useActionState(submitContactForm, initilalState)
  const formRef = useRef<HTMLFormElement>(null)
  const [showToast, setShowToast] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  )

  useEffect(() => {
    if (isPending) {
      setShowToast(null)
    }
    if (state.success) {
      formRef.current?.reset()
      setShowToast({
        type: 'success',
        message: 'Takk for din hendvendelse! Vi tar kontakt så snart som mulig. ',
      })
      setTimeout(() => setShowToast(null), 5000)
    }
    if (state.error) {
      setShowToast({ type: 'error', message: 'Noe gikk galt med sending, prøv igjen senere  ' })
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
          <button onClick={() => setShowToast(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          left: '-9999px',
        }}
        aria-hidden="true"
      >
        <label htmlFor="url">Din nettside</label>
        <input id="url" type="text" name="url" tabIndex={-1} autoComplete="nope" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-text font-medium text-sm uppercase">
          Navn
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="border border-ocean rounded-lg p-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-ocean"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-text font-medium text-sm uppercase">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="border border-ocean rounded-lg p-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-ocean"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="message" className="text-text font-medium text-sm uppercase">
          Melding
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="border border-ocean rounded-lg p-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-ocean resize-none"
        />
      </div>

      <div className="flex justify-end">
        <BaseButton type="submit" disabled={isPending}>
          {isPending ? 'Sender...' : 'Send melding'}
        </BaseButton>
      </div>
    </form>
  )
}
