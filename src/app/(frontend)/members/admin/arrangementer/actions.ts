'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createEvent, deleteEvent, parseEventInput, updateEvent } from '@/lib/admin/events'

export type EventActionState = { success: boolean; error?: string; message?: string }

const LIST_PATH = '/members/admin/arrangementer'

async function getContext() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) throw new Error('Kun for admin')
  return { payload, user }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Noe gikk galt, prøv igjen senere.'
}

export async function saveEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    const { payload, user } = await getContext()
    const input = parseEventInput(formData)
    const id = Number(formData.get('id'))
    if (id) {
      await updateEvent(payload, user, id, input)
    } else {
      await createEvent(payload, user, input)
    }
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
  revalidatePath(LIST_PATH)
  redirect(LIST_PATH)
}

export async function deleteEventAction(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  try {
    const { payload, user } = await getContext()
    await deleteEvent(payload, user, Number(formData.get('id')))
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
  revalidatePath(LIST_PATH)
  redirect(LIST_PATH)
}
