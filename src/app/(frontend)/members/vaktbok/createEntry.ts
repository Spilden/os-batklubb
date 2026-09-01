import type { Payload } from 'payload'
import type { CameraLogEntry } from '@/payload-types'

const VALID_PERIODS = ['morgen', 'ettermiddag', 'kveld'] as const
type Period = (typeof VALID_PERIODS)[number]

export type CreateVaktbokEntryInput = {
  userId: number
  userName: string
  content: string
  period?: string
}

export async function createVaktbokEntry(
  payload: Payload,
  input: CreateVaktbokEntryInput,
): Promise<CameraLogEntry> {
  const content = input.content.trim()
  if (!content) {
    throw new Error('Rapporten kan ikke være tom')
  }

  const period =
    input.period && (VALID_PERIODS as readonly string[]).includes(input.period)
      ? (input.period as Period)
      : undefined

  return payload.create({
    collection: 'camera-log-entries',
    data: {
      date: new Date().toISOString(),
      ...(period ? { period } : {}),
      user: input.userId,
      authorName: input.userName,
      content,
      source: 'live',
    },
  })
}
