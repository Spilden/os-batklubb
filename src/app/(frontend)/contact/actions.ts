'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { Resend } from 'resend'

function getRecipientEmail(recipient: string): string {
  const emails: Record<string, string> = {
    board: process.env.CONTACT_TO_EMAIL_BOARD!,
    slipway: process.env.CONTACT_TO_EMAIL_SLIPWAY!,
  }
  return emails[recipient] ?? ''
}

function getRecipientLabel(recipient: string): string {
  const labels: Record<string, string> = {
    board: 'Styret',
    slipway: 'Slippvakt',
  }
  return labels[recipient] ?? recipient
}

const resend = new Resend(process.env.RESEND_API_KEY)

export async function submitContactForm(_prevState: unknown, formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string
  const honeypot = formData.get('url') as string
  const recipient = formData.get('recipient') as string
  const toEmail = getRecipientEmail(recipient)
  const recipientLabel = getRecipientLabel(recipient)

  if (honeypot) {
    return { success: true }
  }

  if (!name || !email || !message || !recipient) {
    return { success: false, error: 'Alle felt ,må fylles ut.' }
  }

  if (!toEmail) {
    return { success: false, error: 'Noe gikk galt. Prøv igjen senere.' }
  }

  try {
    const payload = await getPayload({ config })

    await payload.create({
      collection: 'contact-submissions',
      data: { recipient: recipientLabel, name, email, message },
    })

    await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL!,
      to: toEmail,
      subject: `Ny henvendelse fra ${name}`,
      text: `Til: ${recipientLabel}\n\nNavn: ${name}\nE-post: ${email}\n\nMelding:\n${message}`,
    })

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Noe gikk galt, Prøv igjen senere' }
  }
}
