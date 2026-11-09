'use client'

import { useActionState } from 'react'
import BaseButton from '@/components/BaseButton'
import { FormMessage } from './FormMessage'
import { chipClass, inputClass, labelClass } from './styles'
import type { MemberActionState } from '@/app/(frontend)/members/admin/medlemmer/actions'

type Props = {
  action: (prev: MemberActionState, formData: FormData) => Promise<MemberActionState>
  submitLabel: string
  isSelf?: boolean
  initial?: {
    id: number
    name: string
    email: string
    medlemSiden?: string | null
    roles: string[]
  }
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'news_admin', label: 'Nyhetsredaktør' },
  { value: 'kameravakt', label: 'Kameravakt' },
]

export function MemberForm({ action, submitLabel, initial, isSelf = false }: Props) {
  const [state, formAction, isPending] = useActionState(action, { success: false })
  const today = new Date().toISOString().slice(0, 10)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <FormMessage error={state.error} message={state.message} />

      <div className="flex flex-col gap-1">
        <label htmlFor="name" className={labelClass}>Navn</label>
        <input id="name" name="name" required defaultValue={initial?.name} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className={labelClass}>E-post</label>
        <input id="email" name="email" type="email" required defaultValue={initial?.email} className={inputClass} />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="medlemSiden" className={labelClass}>Medlem siden</label>
        <input
          id="medlemSiden"
          name="medlemSiden"
          type="date"
          defaultValue={initial ? (initial.medlemSiden?.slice(0, 10) ?? '') : today}
          className={inputClass}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className={`${labelClass} pb-2`}>Roller</legend>
        <div className="flex flex-wrap gap-3">
          <label className={chipClass}>
            <input type="checkbox" checked disabled readOnly className="sr-only" />
            Medlem
          </label>
          {ROLE_OPTIONS.map((role) => {
            const lockedAdmin = isSelf && role.value === 'admin'
            return (
              <label key={role.value} className={chipClass} title={lockedAdmin ? 'Du kan ikke fjerne din egen admin-rolle' : undefined}>
                <input
                  type="checkbox"
                  name="roles"
                  value={role.value}
                  defaultChecked={initial?.roles.includes(role.value)}
                  disabled={lockedAdmin}
                  className="sr-only"
                />
                {role.label}
              </label>
            )
          })}
          {isSelf && <input type="hidden" name="roles" value="admin" />}
        </div>
      </fieldset>

      <div className="flex justify-end">
        <BaseButton type="submit" disabled={isPending}>
          {isPending ? 'Lagrer...' : submitLabel}
        </BaseButton>
      </div>
    </form>
  )
}
