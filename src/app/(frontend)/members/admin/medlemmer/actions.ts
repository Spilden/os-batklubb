'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createMember,
  sendWelcomeEmail,
  setMemberActive,
  updateMember,
  type MemberInput,
  type MemberRole,
} from '@/lib/admin/members'

export type MemberActionState = { success: boolean; error?: string; message?: string }

const EXTRA_ROLES: MemberRole[] = ['admin', 'news_admin', 'kameravakt']

async function getContext() {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await headers() })
  return { payload, user }
}

function parseMemberInput(formData: FormData): MemberInput {
  const roles = formData.getAll('roles').map(String)
  return {
    name: String(formData.get('name') ?? ''),
    email: String(formData.get('email') ?? ''),
    medlemSiden: String(formData.get('medlemSiden') ?? '') || null,
    extraRoles: EXTRA_ROLES.filter((r) => roles.includes(r)),
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Noe gikk galt, prøv igjen senere.'
}

export async function createMemberAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const { payload, user } = await getContext()
  let target: string
  try {
    if (!user) throw new Error('Kun for admin')
    const { user: created, emailSent } = await createMember(payload, user, parseMemberInput(formData))
    target = `/members/admin/medlemmer/${created.id}?opprettet=${emailSent ? '1' : 'uten-epost'}`
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
  revalidatePath('/members/admin/medlemmer')
  redirect(target)
}

export async function updateMemberAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const { payload, user } = await getContext()
  try {
    if (!user) throw new Error('Kun for admin')
    await updateMember(payload, user, Number(formData.get('id')), parseMemberInput(formData))
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
  revalidatePath('/members/admin/medlemmer')
  return { success: true, message: 'Endringene er lagret.' }
}

export async function setMemberActiveAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const { payload, user } = await getContext()
  const active = formData.get('active') === 'true'
  try {
    if (!user) throw new Error('Kun for admin')
    await setMemberActive(payload, user, Number(formData.get('id')), active)
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
  revalidatePath('/members/admin/medlemmer')
  return { success: true, message: active ? 'Medlemmet er aktivert.' : 'Medlemmet er deaktivert.' }
}

export async function resendWelcomeAction(
  _prev: MemberActionState,
  formData: FormData,
): Promise<MemberActionState> {
  const { payload, user } = await getContext()
  try {
    if (!user) throw new Error('Kun for admin')
    await sendWelcomeEmail(payload, user, Number(formData.get('id')))
  } catch (error) {
    return { success: false, error: errorMessage(error) }
  }
  return { success: true, message: 'Velkomst-e-posten er sendt.' }
}
