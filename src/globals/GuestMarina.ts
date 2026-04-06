import { GlobalConfig } from 'payload'

export const GuestMarina: GlobalConfig = {
  slug: 'guestMarina',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Overskrift',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description:
          'Dette feltet er hovedinnholdet som forklarer gjester om gjestehavnen. Formatering her blir brukt på siden'
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      admin: {
        placeholder: 'døgnpris på gjestehavnen',
      },
    },
    {
      name: 'paymentInfo',
      type: 'text',
      required: true,
      admin:{
        description: 'Legg inn informasjon om betaling av døgnpris'
      },
    },
  ],
}