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
    defaultSort: '-date',
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
      required: true,
      defaultValue: 'live',
      options: [
        { label: 'Ny rapport', value: 'live' },
        { label: 'Importert historikk', value: 'imported' },
      ],
    },
  ],
}
