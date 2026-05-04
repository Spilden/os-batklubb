'use client'

import BaseButton from '@/components/BaseButton'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [error, setError] = useState('')
  const router = useRouter()
  const [confirmPassword, setConfirmPassword] = useState('')

  async function handleSubmit() {
    if (!token) {
      setError('Ugyldig lenke.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passord matcher ikke.')
    }
    try {
      const response = await fetch('api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (response.ok) {
        router.push('/')
      } else {
        setError('Noe gikk galt.')
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="bg-sage rounded-xl shadow-lg w-full max-w-xl mx-auto">
      <div className="rounded-t-xl bg-ocean p-4">
        <h1 className="text-text text-2xl font-bold text-center">Tilbakestill passord</h1>
      </div>
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-text font-medium text-sm uppercase">Nytt passord</h2>
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <input
              className="border border-ocean rounded-lg p-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-ocean"
              type="password"
              placeholder="Nytt passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="text-text font-medium text-sm uppercase">Bekreft passord</h2>
            <input
              className="border border-ocean rounded-lg p-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-ocean"
              type="password"
              placeholder="Bekreft passord"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <BaseButton onClick={handleSubmit}>Sett nytt passord</BaseButton>
          </div>
        </div>
      </div>
    </div>
  )
}
