'use client'

import { useActionState } from 'react'
import { submitContactForm } from '@/app/(frontend)/contact/actions'

const initilalState = {
  success: false,
  error: '',
}

export default function ContactForm() {
  const [state, action] = useActionState(submitContactForm, initilalState)

  if (state.success) {
    return <p>Takk for din hendvendelse! Vi tar kontakt så snart som mulig.</p>
  }
  return (
    <form action={action}>
      {state.error && <p>{state.error}</p>}

      <div>
        <label htmlFor="name">Navn</label>
        <input id="name" name="name" type="text" required className="border"/>
      </div>

      <div>
        <label htmlFor="email">E-post</label>
        <input id="email" name="email" type="email" required className="border"/>
      </div>

      <div>
        <label htmlFor="message">Melding</label>
        <textarea id="message" name="message" required rows={5} className="border"/>
      </div>

      {/*TODO implementere basebutton */}
      <button type="submit">Send melding</button>
    </form>
  )
}
