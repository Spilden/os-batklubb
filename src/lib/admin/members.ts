import crypto from 'crypto'
import type { Payload, Where } from 'payload'
import type { User } from '@/payload-types'
import { requireAdmin } from './requireAdmin'
import { welcomeEmailHTML } from './welcomeEmail'

export type MemberRole = 'admin' | 'news_admin' | 'kameravakt'

export const MEMBER_ROLE_LABELS: Record<MemberRole | 'member', string> = {
  member: 'Medlem',
  admin: 'Admin',
  news_admin: 'Nyhetsredaktør',
  kameravakt: 'Kameravakt',
}

export type MemberInput = {
  name: string
  email: string
  medlemSiden?: string | null
  extraRoles: MemberRole[]
}

const WELCOME_LINK_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000

function normalizeInput(input: MemberInput) {
  const name = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (!name) throw new Error('Navn må fylles ut.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Ugyldig e-postadresse.')
  const roles: User['roles'] = ['member', ...input.extraRoles.filter((r) => r !== ('member' as string))]
  return { name, email, medlemSiden: input.medlemSiden || null, roles }
}

async function assertEmailFree(payload: Payload, email: string, exceptId?: number) {
  const where: Where = { email: { equals: email } }
  const { docs } = await payload.find({ collection: 'users', where, limit: 1, depth: 0 })
  if (docs.length > 0 && docs[0].id !== exceptId) {
    throw new Error('Det finnes allerede et medlem med denne e-postadressen.')
  }
}

export async function listMembers(
  payload: Payload,
  admin: User,
  opts: { includeInactive: boolean; search?: string },
): Promise<User[]> {
  requireAdmin(admin)
  const and: Where[] = []
  if (!opts.includeInactive) and.push({ active: { not_equals: false } })
  const search = opts.search?.trim()
  if (search) {
    and.push({ or: [{ name: { contains: search } }, { email: { contains: search } }] })
  }
  const { docs } = await payload.find({
    collection: 'users',
    where: and.length ? { and } : {},
    sort: 'name',
    limit: 0,
    depth: 0,
    user: admin,
    overrideAccess: false,
  })
  return docs
}

export async function getMember(payload: Payload, admin: User, id: number): Promise<User> {
  requireAdmin(admin)
  return payload.findByID({ collection: 'users', id, depth: 0, user: admin, overrideAccess: false })
}

export async function sendWelcomeEmail(payload: Payload, admin: User, id: number): Promise<void> {
  const member = await getMember(payload, admin, id)
  if (member.active === false) throw new Error('Medlemmet er deaktivert.')

  const token = await payload.forgotPassword({
    collection: 'users',
    data: { email: member.email },
    disableEmail: true,
    expiration: WELCOME_LINK_LIFETIME_MS,
  })
  if (!token) throw new Error('Klarte ikke lage velkomstlenke.')

  const url = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}`
  await payload.sendEmail({
    to: member.email,
    subject: 'Velkommen til Os Båtklubb',
    html: welcomeEmailHTML(member.name, url),
  })
}

export async function createMember(
  payload: Payload,
  admin: User,
  input: MemberInput,
): Promise<{ user: User; emailSent: boolean }> {
  requireAdmin(admin)
  const data = normalizeInput(input)
  await assertEmailFree(payload, data.email)

  const user = await payload.create({
    collection: 'users',
    data: { ...data, password: crypto.randomBytes(32).toString('hex') },
    user: admin,
    overrideAccess: false,
  })

  try {
    await sendWelcomeEmail(payload, admin, user.id)
    return { user, emailSent: true }
  } catch (error) {
    console.error('Velkomst-e-post feilet', error)
    return { user, emailSent: false }
  }
}

export async function updateMember(
  payload: Payload,
  admin: User,
  id: number,
  input: MemberInput,
): Promise<User> {
  requireAdmin(admin)
  const data = normalizeInput(input)
  await assertEmailFree(payload, data.email, id)
  return payload.update({ collection: 'users', id, data, user: admin, overrideAccess: false })
}

export async function setMemberActive(
  payload: Payload,
  admin: User,
  id: number,
  active: boolean,
): Promise<User> {
  requireAdmin(admin)
  return payload.update({
    collection: 'users',
    id,
    data: { active },
    user: admin,
    overrideAccess: false,
  })
}
