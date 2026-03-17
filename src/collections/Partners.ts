import type { CollectionConfig } from 'payload'

export const Partners: CollectionConfig = {
  slug: 'partners',
  access: {
    read: () => true
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Partnerens/sponsorens navn'
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'deal',
      type: 'richText',
      admin: {
        description: 'Eventuell fordelsavtale kan legges inn her.'
      },
    }
  ]
}

