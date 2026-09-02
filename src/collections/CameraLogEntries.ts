import type { CollectionConfig } from 'payload'

export const CameraLogEntries: CollectionConfig = {
  slug: 'camera-log-entries',
  labels: {
    singular: 'Kameravaktlogg',
    plural: 'Kameravaktlogg',
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'user', 'date', 'source'],
  },
  defaultSort: '-date',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { user: { equals: user.id } }
    },
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data, originalDoc }) => {
        if (operation === 'create' && req.user) {
          data.user = req.user.id
          data.authorName = req.user.name
        }
        if (operation === 'update' && originalDoc) {
          data.user = originalDoc.user
          data.authorName = originalDoc.authorName
          data.editedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      label: 'Bruker',
    },
    {
      name: 'authorName',
      type: 'text',
      label: 'Navn',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      label: 'Rapport',
      required: true,
    },
    {
      name: 'editedAt',
      type: 'date',
      label: 'Sist endret',
      admin: { hidden: true, date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'live',
      options: [
        { label: 'Ny rapport', value: 'live' },
        { label: 'Importert historikk', value: 'imported' },
      ],
    },
  ],
}
