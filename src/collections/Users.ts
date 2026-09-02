import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    forgotPassword: {
      generateEmailHTML: (args) => {
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
      ],
    },
  ],
}
