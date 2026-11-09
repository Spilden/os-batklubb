'use client'

import { useActionState } from 'react'
import BaseButton from '@/components/BaseButton'
import { FormMessage } from './FormMessage'
import {
  resendWelcomeAction,
  setMemberActiveAction,
} from '@/app/(frontend)/members/admin/medlemmer/actions'

type Props = { id: number; active: boolean; isSelf: boolean }

export function MemberStatusActions({ id, active, isSelf }: Props) {
  const [welcome, welcomeAction, welcomePending] = useActionState(resendWelcomeAction, { success: false })
  const [status, statusAction, statusPending] = useActionState(setMemberActiveAction, { success: false })

  return (
    <div className="flex flex-col gap-4">
      <FormMessage error={welcome.error} message={welcome.message} />
      <FormMessage error={status.error} message={status.message} />
      <div className="flex flex-wrap gap-3">
        {active && (
          <form action={welcomeAction}>
            <input type="hidden" name="id" value={id} />
            <BaseButton type="submit" variant="secondary" disabled={welcomePending}>
              {welcomePending ? 'Sender...' : 'Send velkomst-e-post på nytt'}
            </BaseButton>
          </form>
        )}
        {!isSelf && (
          <form
            action={statusAction}
            onSubmit={(e) => {
              if (active && !confirm('Vil du deaktivere dette medlemmet? De kan ikke logge inn før de aktiveres igjen.')) {
                e.preventDefault()
              }
            }}
          >
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="active" value={active ? 'false' : 'true'} />
            <BaseButton type="submit" variant="secondary" disabled={statusPending}>
              {active ? 'Deaktiver' : 'Aktiver igjen'}
            </BaseButton>
          </form>
        )}
      </div>
    </div>
  )
}
