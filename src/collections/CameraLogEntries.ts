import type { CollectionConfig } from 'payload'

export const CameraLogEntries: CollectionConfig = {
  slug: 'camera-log-entries',
  labels: {
    singular: 'Kameravaktlogg',
    plural: 'Kameravaktlogg',
  },
  admin: {
    useAsTitle: 'authorName',
    defaultColumns: ['authorName', 'user', 'period', 'date', 'source'],
  },
  defaultSort: '-date',
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
    delete: ({ req: { user } }) => Boolean(user?.roles?.includes('admin')),
  },
  hooks: {
    beforeChange: [
      ({ req, operation, data }) => {
        if (operation === 'create' && req.user) {
          data.user = req.user.id
          data.authorName = req.user.name
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
      name: 'period',
      type: 'select',
      label: 'Periode',
      options: [
        { label: 'Morgen', value: 'morgen' },
        { label: 'Ettermiddag', value: 'ettermiddag' },
        { label: 'Kveld', value: 'kveld' },
      ],
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
