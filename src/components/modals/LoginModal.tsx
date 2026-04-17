'use client'
import BaseButton from '@/components/BaseButton'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginModal({ onCloseAction }: { onCloseAction: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit() {
    try {
      const response = await fetch('api/users/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })
      if (response.ok) {
        router.push('/users')
        router.refresh()
        onCloseAction()
      } else {
        setError('Feil e-post eller passord')
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-100"
      onClick={onCloseAction}
    >
      <div className="bg-background rounded-xl shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="rounded-t-xl bg-background p-4">
          <h1 className="text-text text-2xl font-bold text-center">Logg Inn</h1>
        </div>
        <div className="flex flex-col p-6 gap-4">
          <div className="flex flex-col gap-1">
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <h2 className="text-text font-medium text-sm uppercase">E-post</h2>
            <input
              className="border border-ocean rounded-lg p-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-ocean"
              type="email"
              placeholder="ola@nordmann.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-text font-medium text-sm uppercase">Passord</h2>
            <input
              className="border border-ocean rounded-lg p-2 bg-surface text-text focus:outline-none focus:ring-2 focus:ring-ocean"
              type="password"
              placeholder="Passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <BaseButton onClick={handleSubmit}>Logg Inn</BaseButton>
          </div>
        </div>
      </div>
    </div>
  )
}
