'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createVaktbokEntry } from './createEntry'

export async function submitVaktbokEntry(_prevState: unknown, formData: FormData) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) {
    return { success: false, error: 'Du må være innlogget' }
  }

  const content = formData.get('content') as string
  const period = formData.get('period') as string

  try {
    await createVaktbokEntry(payload, {
      userId: user.id,
      userName: user.name,
      content,
      period,
    })
    revalidatePath('/members/vaktbok')
    return { success: true, error: '' }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Noe gikk galt, prøv igjen senere',
    }
  }
}
