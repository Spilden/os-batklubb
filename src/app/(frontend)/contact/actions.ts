'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContactForm(formaData: FormData) {
  const name = formaData.get('name') as string
  const email = formaData.get('email') as string
  const message = formaData.get('message') as string

  if (!name || !email || !message) {
    return { success: false, error: 'Alle felt ,må fylles ut.' }
  }
  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'contact-submissions',
      data: { name, email, message },
    })

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL!,
      to: process.env.CONTACT_TO_EMAIL!,
      subject: `Ny henvendlese fra ${name}`,
      text: `Navn: ${name}\nE-post: ${email}\n\nMelding:\n${message}`,
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Noe gikk galt, Prøv igjen senere' }
  }
}
