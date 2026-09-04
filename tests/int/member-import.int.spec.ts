import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterEach, expect } from 'vitest'
import { importMembers, parseMembersCsv } from '@/scripts/member-import'

// TESTFIKSTUR marker keeps these emails distinguishable from real imported data.
const csvFixture = [
  [
    'Etternavn',
    'Fornavn',
    'Født',
    'Kjønn',
    'Avd',
    'Gruppe',
    'Distrikt',
    'Kontigentklasse',
    'Medl.Nr.',
    'Medlemstype',
    'Gate 1',
    'Gate 2',
    'Postnr',
    'Poststed',
    'Land',
    'Hjemme tlf',
    'Mobil tlf',
    'e-post 1',
    'e-post 2',
    'Startet',
  ].join('\t'),
  [
    'Testesen',
    'Ola',
    '',
    'Mann',
    '',
    '',
    '',
    'Ordinær pris',
    '',
    'Medlem',
    'Gate 1',
    '',
    '5000',
    'Bergen',
    '',
    '',
    '900 00 001',
    'Testfikstur-Ola@example.com',
    '',
    '31.12.2022 00:00:00',
  ].join('\t'),
  [
    'Testesen',
    '',
    '',
    'Kvinne',
    '',
    '',
    '',
    'Ordinær pris',
    '',
    'Medlem',
    'Gate 2',
    '',
    '5000',
    'Bergen',
    '',
    '',
    '900 00 002',
    '',
    '',
    '01.01.2020 00:00:00',
  ].join('\t'),
  [
    '',
    'Kari',
    '',
    'Kvinne',
    '',
    '',
    '',
    'Ordinær pris',
    '',
    'Medlem',
    'Gate 3',
    '',
    '5000',
    'Bergen',
    '',
    '',
    '900 00 003',
    'testfikstur-kari@example.com',
    '',
    '',
  ].join('\t'),
].join('\n')

describe('parseMembersCsv', () => {
  it('parses a row into name, email and medlemSiden', () => {
    const { members } = parseMembersCsv(csvFixture)
    expect(members).toHaveLength(2)
    expect(members[0]).toEqual({
      name: 'Ola Testesen',
      email: 'Testfikstur-Ola@example.com',
      medlemSiden: new Date(Date.UTC(2022, 11, 31)).toISOString(),
    })
  })

  it('skips a row missing an email', () => {
    const { members, skipped } = parseMembersCsv(csvFixture)
    expect(members.find((m) => m.name === 'Testesen')).toBeUndefined()
    expect(skipped).toContainEqual({ row: 3, reason: 'Mangler e-post' })
  })

  it('handles a row with a missing medlemSiden date', () => {
    const { members } = parseMembersCsv(csvFixture)
    const kari = members.find((m) => m.email === 'testfikstur-kari@example.com')
    expect(kari?.medlemSiden).toBeNull()
  })
})

describe('importMembers', () => {
  let payload: Payload
  const createdUserIds: number[] = []

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterEach(async () => {
    if (createdUserIds.length === 0) return
    await payload.delete({
      collection: 'users',
      where: { id: { in: [...createdUserIds] } },
    })
    createdUserIds.length = 0
  })

  it('creates a user per parsed member and skips ones that already exist', async () => {
    const { members } = parseMembersCsv(csvFixture)

    const first = await importMembers(payload, members)
    expect(first.created).toBe(2)
    expect(first.alreadyExisted).toBe(0)

    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { in: members.map((m) => m.email.toLowerCase()) } },
    })
    expect(docs).toHaveLength(2)
    createdUserIds.push(...docs.map((doc) => doc.id))

    const ola = docs.find((d) => d.email === 'testfikstur-ola@example.com')
    expect(ola?.roles).toEqual(['member'])
    expect(ola?.medlemSiden).toBe(new Date(Date.UTC(2022, 11, 31)).toISOString())

    const second = await importMembers(payload, members)
    expect(second.created).toBe(0)
    expect(second.alreadyExisted).toBe(2)
  })
})
