import type { Payload } from 'payload'
import type { Event, User } from '@/payload-types'
import { requireAdmin } from './requireAdmin'

export const EVENT_COLORS = [
  { label: 'Havblå', value: '#1e40af' },
  { label: 'Blå', value: '#2563eb' },
  { label: 'Turkis', value: '#0d9488' },
  { label: 'Grønn', value: '#16a34a' },
  { label: 'Sand', value: '#ca8a04' },
  { label: 'Oransje', value: '#ea580c' },
  { label: 'Rød', value: '#dc2626' },
  { label: 'Lilla', value: '#7c3aed' },
] as const

export type EventStatus = 'draft' | 'published' | 'cancelled'

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  draft: 'Utkast',
  published: 'Publisert',
  cancelled: 'Avlyst',
}

export type EventInput = {
  title: string
  description: string
  startTime: string
  endTime: string
  color: string
  status: EventStatus
}

function parseDate(value: FormDataEntryValue | null): string {
  const date = new Date(String(value ?? ''))
  if (Number.isNaN(date.getTime())) throw new Error('Ugyldig dato.')
  return date.toISOString()
}

export function parseEventInput(formData: FormData): EventInput {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  if (!title) throw new Error('Tittel må fylles ut.')
  if (!description) throw new Error('Beskrivelse må fylles ut.')

  const startTime = parseDate(formData.get('startTime'))
  const endTime = parseDate(formData.get('endTime'))
  if (endTime <= startTime) throw new Error('Slutt må være etter start.')

  const rawStatus = String(formData.get('status') ?? '')
  const status: EventStatus = rawStatus in EVENT_STATUS_LABELS ? (rawStatus as EventStatus) : 'draft'
  const rawColor = String(formData.get('color') ?? '')
  const color = EVENT_COLORS.some((c) => c.value === rawColor) ? rawColor : EVENT_COLORS[0].value

  return { title, description, startTime, endTime, color, status }
}

export async function listEvents(
  payload: Payload,
  admin: User,
  opts: { past: boolean },
): Promise<Event[]> {
  requireAdmin(admin)
  const now = new Date().toISOString()
  const { docs } = await payload.find({
    collection: 'events',
    where: opts.past ? { endTime: { less_than: now } } : { endTime: { greater_than_equal: now } },
    sort: opts.past ? '-startTime' : 'startTime',
    limit: 0,
    depth: 0,
    user: admin,
    overrideAccess: false,
  })
  return docs
}

export async function getEvent(payload: Payload, admin: User, id: number): Promise<Event> {
  requireAdmin(admin)
  return payload.findByID({ collection: 'events', id, depth: 0, user: admin, overrideAccess: false })
}

export async function createEvent(payload: Payload, admin: User, input: EventInput): Promise<Event> {
  requireAdmin(admin)
  return payload.create({
    collection: 'events',
    data: { ...input, user: admin.id },
    user: admin,
    overrideAccess: false,
  })
}

export async function updateEvent(
  payload: Payload,
  admin: User,
  id: number,
  input: EventInput,
): Promise<Event> {
  requireAdmin(admin)
  return payload.update({ collection: 'events', id, data: input, user: admin, overrideAccess: false })
}

export async function deleteEvent(payload: Payload, admin: User, id: number): Promise<void> {
  requireAdmin(admin)
  await payload.delete({ collection: 'events', id, user: admin, overrideAccess: false })
}
