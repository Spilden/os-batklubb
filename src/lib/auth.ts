import { getPayload } from 'payload'
import config from 'src/payload.config'
import { headers } from 'next/headers'

export async function getUser() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return user ?? null
}
