import type { Payload } from 'payload'
import type { CameraLogEntry, User } from '@/payload-types'

export type CreateVaktbokEntryInput = {
  userId: number
  userName: string
  content: string
}

export async function createVaktbokEntry(
  payload: Payload,
  input: CreateVaktbokEntryInput,
): Promise<CameraLogEntry> {
  const content = input.content.trim()
  if (!content) {
    throw new Error('Rapporten kan ikke være tom')
  }

  return payload.create({
    collection: 'camera-log-entries',
    data: {
      date: new Date().toISOString(),
      user: input.userId,
      authorName: input.userName,
      content,
      source: 'live',
    },
  })
}

export type UpdateVaktbokEntryInput = {
  entryId: number
  user: User
  content: string
}

export async function updateVaktbokEntry(
  payload: Payload,
  input: UpdateVaktbokEntryInput,
): Promise<CameraLogEntry> {
  const content = input.content.trim()
  if (!content) {
    throw new Error('Rapporten kan ikke være tom')
  }

  return payload.update({
    collection: 'camera-log-entries',
    id: input.entryId,
    overrideAccess: false,
    user: input.user,
    data: { content },
  })
}
