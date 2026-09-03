import type { Payload } from 'payload'
import crypto from 'crypto'

export type ParsedMember = {
  name: string
  email: string
  medlemSiden: string | null
}

export type SkippedRow = {
  row: number
  reason: string
}

function parseNorwegianDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})/)
  if (!match) return null
  const [, day, month, year] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  return date.toISOString()
}

export function parseMembersCsv(content: string): {
  members: ParsedMember[]
  skipped: SkippedRow[]
} {
  const lines = content.split('\n').map((line) => line.replace(/\r$/, ''))
  const header = lines[0].split('\t')
  const col = (name: string) => header.indexOf(name)

  const etternavnCol = col('Etternavn')
  const fornavnCol = col('Fornavn')
  const emailCol = col('e-post 1')
  const startetCol = col('Startet')

  const members: ParsedMember[] = []
  const skipped: SkippedRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    const fields = line.split('\t')

    const etternavn = fields[etternavnCol]?.trim() ?? ''
    const fornavn = fields[fornavnCol]?.trim() ?? ''
    const email = fields[emailCol]?.trim() ?? ''
    const name = [fornavn, etternavn].filter(Boolean).join(' ')

    if (!email) {
      skipped.push({ row: i + 1, reason: 'Mangler e-post' })
      continue
    }
    if (!name) {
      skipped.push({ row: i + 1, reason: 'Mangler navn' })
      continue
    }

    const medlemSiden = startetCol >= 0 ? parseNorwegianDate(fields[startetCol] ?? '') : null

    members.push({ name, email, medlemSiden })
  }

  return { members, skipped }
}

export async function importMembers(
  payload: Payload,
  members: ParsedMember[],
): Promise<{ created: number; alreadyExisted: number }> {
  let created = 0
  let alreadyExisted = 0

  for (const member of members) {
    // Payload lowercases stored emails, so the lookup must match on the same case.
    const existing = await payload.find({
      collection: 'users',
      where: { email: { equals: member.email.toLowerCase() } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      alreadyExisted += 1
      continue
    }

    await payload.create({
      collection: 'users',
      data: {
        name: member.name,
        email: member.email,
        password: crypto.randomBytes(24).toString('hex'),
        roles: ['member'],
        medlemSiden: member.medlemSiden,
      },
    })
    created += 1
  }

  return { created, alreadyExisted }
}
