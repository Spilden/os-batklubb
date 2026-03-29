'use client'

import { useActionState } from 'react'
import { submitContactForm } from '@/app/(frontend)/contact/actions'
import BaseButton from '@/components/BaseButton'

const initilalState = {
  success: false,
  error: '',
}

export default function ContactForm() {
  const [state, action, isPending] = useActionState(submitContactForm, initilalState)

  if (state.success) {
    return (
      <p className="text-center text-text font-medium py-8">
        Takk for din hendvendelse! Vi tar kontakt så snart som mulig.
      </p>
    )
  }
  return (
    <form action={action} className="flex flex-col gap-4">
      {state.error && <p>{state.error}</p>}

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
