import type { CollectionConfig } from 'payload'

export const Partners: CollectionConfig = {
  slug: 'partners',
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Partnerens/sponsorens navn'
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
    },
  ]
}

