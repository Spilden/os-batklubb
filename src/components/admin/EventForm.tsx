'use client'

import { useActionState, useEffect, useState } from 'react'
import BaseButton from '@/components/BaseButton'
import { FormMessage } from './FormMessage'
import { DateTimeField } from './DateTimeField'
import { chipClass, inputClass, labelClass } from './styles'
import { defaultEndFor, toISO, toLocalInput } from '@/lib/admin/eventTimes'
import { EVENT_COLORS, EVENT_STATUS_LABELS, type EventStatus } from '@/lib/admin/events'
import {
  deleteEventAction,
  saveEventAction,
} from '@/app/(frontend)/members/admin/arrangementer/actions'

type Props = {
  initial?: {
    id: number
    title: string
    description: string
    startTime: string
    endTime: string
    color?: string | null
    status?: EventStatus | null
  }
}

export function EventForm({ initial }: Props) {
  const [state, formAction, isPending] = useActionState(saveEventAction, { success: false })
  const [deleteState, deleteAction, deletePending] = useActionState(deleteEventAction, { success: false })
  // Filled in after mount so the times use the viewer's timezone, not the server's.
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  useEffect(() => {
    setStart(toLocalInput(initial?.startTime))
    setEnd(toLocalInput(initial?.endTime))
  }, [initial?.startTime, initial?.endTime])
  const selectedColor = initial?.color ?? EVENT_COLORS[0].value

  return (
    <div className="flex flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-4">
        {initial && <input type="hidden" name="id" value={initial.id} />}
        <FormMessage error={state.error} />

        <div className="flex flex-col gap-1">
          <label htmlFor="title" className={labelClass}>Tittel</label>
          <input id="title" name="title" required defaultValue={initial?.title} className={inputClass} />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className={labelClass}>Beskrivelse</label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            defaultValue={initial?.description}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <DateTimeField
              id="start"
              label="Start"
              value={start}
              onChange={(value) => {
                setStart(value)
                if (value && (!end || end <= value)) setEnd(defaultEndFor(value))
              }}
            />
            <input type="hidden" name="startTime" value={toISO(start)} />
          </div>
          <div>
            <DateTimeField
              id="end"
              label="Slutt"
              value={end}
              onChange={setEnd}
              minDate={start ? start.slice(0, 10) : undefined}
            />
            <input type="hidden" name="endTime" value={toISO(end)} />
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${labelClass} pb-2`}>Farge i kalenderen</legend>
          <div className="flex flex-wrap gap-3">
            {EVENT_COLORS.map((c) => (
              <label key={c.value} title={c.label} className="cursor-pointer">
                <input
                  type="radio"
                  name="color"
                  value={c.value}
                  defaultChecked={selectedColor === c.value}
                  className="peer sr-only"
                />
                <span
                  className="block w-9 h-9 rounded-full border-2 border-transparent peer-checked:border-text peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-ocean peer-focus-visible:ring-2 peer-focus-visible:ring-ocean"
                  style={{ backgroundColor: c.value }}
                />
                <span className="sr-only">{c.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className={`${labelClass} pb-2`}>Status</legend>
          <div className="flex flex-wrap gap-3">
            {(Object.keys(EVENT_STATUS_LABELS) as EventStatus[]).map((s) => (
              <label key={s} className={chipClass}>
                <input
                  type="radio"
                  name="status"
                  value={s}
                  defaultChecked={(initial?.status ?? 'draft') === s}
                  className="sr-only"
                />
                {EVENT_STATUS_LABELS[s]}
              </label>
            ))}
          </div>
          <p className="text-text-muted text-xs">
            Utkast vises ikke i kalenderen. Avlyste vises med gjennomstreking.
          </p>
        </fieldset>

        <div className="flex justify-end">
          <BaseButton type="submit" disabled={isPending}>
            {isPending ? 'Lagrer...' : initial ? 'Lagre endringer' : 'Opprett arrangement'}
          </BaseButton>
        </div>
      </form>

      {initial && (
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (!confirm('Vil du slette dette arrangementet? Dette kan ikke angres.')) e.preventDefault()
          }}
          className="flex flex-col gap-2 border-t border-border/50 pt-4"
        >
          <FormMessage error={deleteState.error} />
          <input type="hidden" name="id" value={initial.id} />
          <p className="text-text-muted text-sm">
            Vil du heller avlyse? Velg status «Avlyst» over, så står det gjennomstreket i kalenderen.
          </p>
          <div>
            <BaseButton type="submit" variant="secondary" disabled={deletePending}>
              Slett arrangement
            </BaseButton>
          </div>
        </form>
      )}
    </div>
  )
}
