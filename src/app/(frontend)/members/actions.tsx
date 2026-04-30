'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function bookSlot(slotId: number, comment: string) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) throw new Error('Unauthorized')

  await payload.update({
    collection: 'slipp-slots',
    id: slotId,
    data: { bookedBy: user.id, comment },
  })

  revalidatePath('/members')
}

export async function cancelSlot(slotId: number) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })

  if (!user) throw new Error('Unauthorized')

  await payload.update({
    collection: 'slipp-slots',
    id: slotId,
    data: { bookedBy: null, comment: null },
  })

  revalidatePath('/members')
}