// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'
import {
  createMember,
  listMembers,
  sendWelcomeEmail,
  setMemberActive,
} from '@/lib/admin/members'

import { describe, it, beforeAll, afterAll, beforeEach, expect, vi } from 'vitest'

let payload: Payload

const emails = {
  admin: 'admin-test-members-admin@example.com',
  member: 'admin-test-members-member@example.com',
  created: 'admin-test-members-ny@example.com',
  failing: 'admin-test-members-failmail@example.com',
  inactive: 'admin-test-members-inactive@example.com',
}

async function cleanup() {
  for (const email of Object.values(emails)) {
    await payload.delete({ collection: 'users', where: { email: { equals: email } } })
  }
}

describe('Admin member management', () => {
  let admin: User
  let member: User
  let sendEmail: ReturnType<typeof vi.spyOn>

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await cleanup()
    admin = await payload.create({
      collection: 'users',
      data: { email: emails.admin, name: 'Test Admin', password: 'test1234', roles: ['member', 'admin'] },
    })
    member = await payload.create({
      collection: 'users',
      data: { email: emails.member, name: 'Test Medlem', password: 'test1234', roles: ['member'] },
    })
  })

  beforeEach(() => {
    sendEmail?.mockRestore()
    sendEmail = vi.spyOn(payload, 'sendEmail').mockResolvedValue(undefined)
  })

  afterAll(async () => {
    sendEmail?.mockRestore()
    await cleanup()
  })

  it('createMember normalizes email and always adds member role', async () => {
    const { user } = await createMember(payload, admin, {
      name: 'Ny Person',
      email: ' Admin-Test-Members-Ny@Example.COM ',
      extraRoles: ['kameravakt'],
    })
    expect(user.email).toBe(emails.created)
    expect(user.roles).toContain('member')
    expect(user.roles).toContain('kameravakt')
  })

  it('createMember sends welcome email with reset link', async () => {
    await payload.delete({ collection: 'users', where: { email: { equals: emails.created } } })
    const { emailSent } = await createMember(payload, admin, {
      name: 'Ny Person',
      email: emails.created,
      extraRoles: [],
    })
    expect(emailSent).toBe(true)
    expect(sendEmail).toHaveBeenCalledTimes(1)
    const arg = sendEmail.mock.calls[0][0] as { to: string; html: string }
    expect(arg.to).toBe(emails.created)
    expect(arg.html).toContain('/reset-password?token=')
  })

  it('createMember rejects duplicate email', async () => {
    await expect(
      createMember(payload, admin, { name: 'Dobbel', email: emails.member, extraRoles: [] }),
    ).rejects.toThrow('Det finnes allerede et medlem med denne e-postadressen.')
  })

  it('createMember rejects invalid email and empty name', async () => {
    await expect(
      createMember(payload, admin, { name: 'X', email: 'ikke-en-epost', extraRoles: [] }),
    ).rejects.toThrow('Ugyldig e-postadresse.')
    await expect(
      createMember(payload, admin, { name: '  ', email: 'admin-test-x@example.com', extraRoles: [] }),
    ).rejects.toThrow('Navn må fylles ut.')
  })

  it('createMember keeps user when email fails', async () => {
    sendEmail.mockRejectedValue(new Error('smtp nede'))
    const { user, emailSent } = await createMember(payload, admin, {
      name: 'Feil Post',
      email: emails.failing,
      extraRoles: [],
    })
    expect(emailSent).toBe(false)
    const found = await payload.findByID({ collection: 'users', id: user.id })
    expect(found.email).toBe(emails.failing)
  })

  it('non-admin cannot create member', async () => {
    await expect(
      createMember(payload, member, { name: 'Nei', email: 'admin-test-nei@example.com', extraRoles: [] }),
    ).rejects.toThrow('Kun for admin')
  })

  it('listMembers hides inactive by default', async () => {
    const { user: inactive } = await createMember(payload, admin, {
      name: 'Admin-test Inaktiv',
      email: emails.inactive,
      extraRoles: [],
    })
    await setMemberActive(payload, admin, inactive.id, false)

    const active = await listMembers(payload, admin, { includeInactive: false })
    expect(active.map((u) => u.id)).not.toContain(inactive.id)

    const all = await listMembers(payload, admin, { includeInactive: true })
    expect(all.map((u) => u.id)).toContain(inactive.id)
  })

  it('listMembers search matches name and email', async () => {
    const byName = await listMembers(payload, admin, { includeInactive: false, search: 'Test Medlem' })
    expect(byName.map((u) => u.id)).toContain(member.id)
    const byEmail = await listMembers(payload, admin, {
      includeInactive: false,
      search: 'members-member@',
    })
    expect(byEmail.map((u) => u.id)).toEqual([member.id])
  })

  it('sendWelcomeEmail refuses deactivated member', async () => {
    const [inactive] = (
      await payload.find({ collection: 'users', where: { email: { equals: emails.inactive } } })
    ).docs
    await expect(sendWelcomeEmail(payload, admin, inactive.id)).rejects.toThrow(
      'Medlemmet er deaktivert.',
    )
  })
})
