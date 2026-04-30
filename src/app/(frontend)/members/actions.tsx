'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import type { SlippSetting } from '@/payload-types'

function isLocked(start: Date, end: Date, s: SlippSetting) {
  for (const season of s.highSeasons ?? []) {
    const seasonStart = new Date(season.start)
    const seasonEnd = new Date(season.end)
    const openDate = new Date(season.openDate)
    const now = new Date()

    const overlaps = start <= seasonEnd && end >= seasonStart

    if (!overlaps) continue

    if (now < openDate) {
      return `Booking åpner ${openDate.toLocaleDateString('nb-NO', {
        day: 'numeric', month: 'long', year: 'numeric'
      })}`
    }

    if (now > seasonEnd) {
      return 'Denne sesongen er over'
    }
  }
  return null
}

export async function createSlippRequest(startTime: string, endTime: string, comment: string) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  if (!user) throw new Error('Du må være innlogget')

  const settings = await payload.findGlobal({ slug: 'slipp-settings' })
  const error = isLocked(new Date(startTime), new Date(endTime), settings)
  if (error) throw new Error(error)

  await payload.create({
    collection: 'slipp-bookings',
    data: { startTime, endTime, comment, user: user.id, status: 'pending' },
  })

  revalidatePath('/members')
}