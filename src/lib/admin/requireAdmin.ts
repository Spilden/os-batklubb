import type { User } from '@/payload-types'

export function isAdmin(user: User | null | undefined): user is User {
  return Boolean(user?.roles?.includes('admin'))
}

export function requireAdmin(user: User | null | undefined): User {
  if (!isAdmin(user)) {
    throw new Error('Kun for admin')
  }
  return user
}
