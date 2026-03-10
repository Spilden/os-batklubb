import { CollectionConfig } from 'payload'

export const About: CollectionConfig = {
  slug: 'about',
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
          'Dette feltet er hovedinnholdet i "Om Klubben" seksjonen. Formateringen her blir brukt i artikkelen',
      },
    },
  ],
}
