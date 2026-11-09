import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: (args) => {
        if (args?.user?.active === false) {
          return `
        <!doctype html>
        <html lang="no">
          <body>
            <h2>Kontoen er deaktivert</h2>
            <p>Kontoen din hos Os Båtklubb er deaktivert. Ta kontakt med styret hvis du mener dette er feil.</p>
          </body>
        </html>
        `
        }
        const resetURL = `${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${args?.token}`
        return `
        <!doctype html>
        <html lang="no">
          <body>
            <h2>Tilbakestill passord</h2>
            <p>Klikk lenken under for å sette et nytt passord:</p>
            <p><a href="${resetURL}">${resetURL}</a></p>
          </body>
        </html>
        `
      }
    }
  },
  hooks: {
    beforeLogin: [
      ({ user }) => {
        if (user?.active === false) {
          throw new APIError('Brukeren er deaktivert.', 403)
        }
        return user
      },
    ],
    beforeChange: [
      ({ data, originalDoc, operation, req }) => {
        if (operation !== 'update' || !originalDoc) return data

        const isAdmin = Boolean(req.user?.roles?.includes('admin'))
        const isSelf = req.user?.id === originalDoc.id

        if (isAdmin && isSelf) {
          if (data.active === false) {
            throw new APIError('Du kan ikke deaktivere deg selv.', 400)
          }
          if (
            originalDoc.roles?.includes('admin') &&
            Array.isArray(data.roles) &&
            !data.roles.includes('admin')
          ) {
            throw new APIError('Du kan ikke fjerne din egen admin-rolle.', 400)
          }
        }

        const willBeActive = data.active ?? originalDoc.active
        if (willBeActive === false) {
          // Deactivated users lose existing logins and can't use reset tokens.
          data.sessions = []
          data.resetPasswordToken = null
          data.resetPasswordExpiration = null
        }
        return data
      },
    ],
  },
  access: {
    admin: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    create: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { id: { equals: user.id } }
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { id: { equals: user.id } }
    },
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Navn',
      required: true,
    },
    {
      name: 'medlemSiden',
      type: 'date',
      label: 'Medlem siden',
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Aktiv',
      defaultValue: true,
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
    },
    {
      name: 'roles',
      type: 'select',
      label: 'Roller',
      hasMany: true,
      required: true,
      defaultValue: ['member'],
      access: {
        update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
      },
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Medlem', value: 'member' },
        { label: 'Nyhetsredaktør', value: 'news_admin' },
        { label: 'Kameravakt', value: 'kameravakt' },
      ],
    },
  ],
}
