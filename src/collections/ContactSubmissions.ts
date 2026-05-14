import type { CollectionConfig } from 'payload'

export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['recipient', 'name', 'email', 'createdAt'],
  },
  access: {
    create: () => true,
    read: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'recipient',
      type: 'text',
      label: 'Mottaker',
      required: true,
    },

    {
      name: 'name',
      type: 'text',
      label: 'Navn',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-post',
      required: true,
    },
    {
      name: 'message',
      type: 'textarea',
      label: 'Melding',
      required: true,
    },
  ],
}
