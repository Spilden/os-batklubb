'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createClubhouseBookingRequest(startTime: string, endTime: string, comment: string) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) throw new Error('Du må være innlogget')

  await payload.create({
    collection: 'clubhouse-bookings',
    data: { startTime, endTime, comment, user: user.id, status: 'pending' },
  })

  revalidatePath('/members')
}
