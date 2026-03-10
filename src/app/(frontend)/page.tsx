import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import BaseButton from '@/components/BaseButton'

export default async function HomePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  return (
    <div className="flex pt-2 items-center justify-center">
      <div className="bg-white rounded-xl p-8 shadow-lg w-96">
        <h1 className="font-display text-3xl text-text">Her er en tittel</h1>
        <p className="text-text-muted mt-2">Her er en beskrivelse.</p>
        <div>
          <BaseButton>primary</BaseButton>
          <BaseButton variant="secondary">Secondary</BaseButton>
          <BaseButton variant="text">textbutton</BaseButton>
        </div>
      </div>
    </div>
  )
}
