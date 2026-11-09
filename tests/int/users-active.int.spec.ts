// @vitest-environment node
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import type { User } from '@/payload-types'

import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload

const emails = {
  admin: 'admin-test-active-admin@example.com',
  member: 'admin-test-active-member@example.com',
  target: 'admin-test-active-target@example.com',
  login: 'admin-test-active-login@example.com',
}
const PASSWORD = 'test1234'

async function cleanup() {
  for (const email of Object.values(emails)) {
    await payload.delete({ collection: 'users', where: { email: { equals: email } } })
  }
}

async function makeUser(email: string, roles: User['roles']): Promise<User> {
  return payload.create({
    collection: 'users',
    data: { email, name: email.split('@')[0], password: PASSWORD, roles },
  })
}

describe('Users active flag', () => {
  let admin: User
  let member: User

  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    await cleanup()
    admin = await makeUser(emails.admin, ['member', 'admin'])
    member = await makeUser(emails.member, ['member'])
  })

  afterAll(async () => {
    await cleanup()
  })

  it('new users are active by default', () => {
    expect(member.active).toBe(true)
  })

  it('admin cannot deactivate themselves', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: admin.id,
        data: { active: false },
        user: admin,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('admin cannot remove own admin role', async () => {
    await expect(
      payload.update({
        collection: 'users',
        id: admin.id,
        data: { roles: ['member'] },
        user: admin,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('admin can deactivate another member', async () => {
    const target = await makeUser(emails.target, ['member'])
    const updated = await payload.update({
      collection: 'users',
      id: target.id,
      data: { active: false },
      user: admin,
      overrideAccess: false,
    })
    expect(updated.active).toBe(false)
  })

  it('member cannot change active on themselves', async () => {
    const updated = await payload.update({
      collection: 'users',
      id: member.id,
      data: { active: false },
      user: member,
      overrideAccess: false,
    })
    expect(updated.active).toBe(true)
  })

  describe('deactivated login user', () => {
    let loginUser: User

    beforeAll(async () => {
      loginUser = await makeUser(emails.login, ['member'])
      await payload.login({
        collection: 'users',
        data: { email: emails.login, password: PASSWORD },
      })
      await payload.update({
        collection: 'users',
        id: loginUser.id,
        data: { active: false },
        user: admin,
        overrideAccess: false,
      })
    })

    it('deactivating clears sessions', async () => {
      const fresh = await payload.findByID({ collection: 'users', id: loginUser.id })
      expect(fresh.sessions ?? []).toHaveLength(0)
    })

    it('deactivated user cannot log in', async () => {
      await expect(
        payload.login({
          collection: 'users',
          data: { email: emails.login, password: PASSWORD },
        }),
      ).rejects.toThrow()
    })

    it('reset token issued before deactivation cannot be used afterwards', async () => {
      const email = 'admin-test-active-oldtoken@example.com'
      await payload.delete({ collection: 'users', where: { email: { equals: email } } })
      const u = await makeUser(email, ['member'])
      const token = await payload.forgotPassword({
        collection: 'users',
        data: { email },
        disableEmail: true,
      })
      await payload.update({
        collection: 'users',
        id: u.id,
        data: { active: false },
        user: admin,
        overrideAccess: false,
      })
      try {
        await payload
          .resetPassword({
            collection: 'users',
            data: { token: token!, password: 'nytt-passord-123' },
            overrideAccess: true,
          })
          .catch(() => null)
        // Reactivate and check the password was NOT changed by the stale token.
        await payload.update({ collection: 'users', id: u.id, data: { active: true } })
        await expect(
          payload.login({ collection: 'users', data: { email, password: 'nytt-passord-123' } }),
        ).rejects.toThrow()
      } finally {
        await payload.delete({ collection: 'users', id: u.id })
      }
    })

    it('forgotPassword token for deactivated user cannot be used', async () => {
      const token = await payload.forgotPassword({
        collection: 'users',
        data: { email: emails.login },
        disableEmail: true,
      })
      await expect(
        payload.resetPassword({
          collection: 'users',
          data: { token: token ?? 'missing', password: 'nytt-passord-123' },
          overrideAccess: true,
        }),
      ).rejects.toThrow()
    })
  })
})
