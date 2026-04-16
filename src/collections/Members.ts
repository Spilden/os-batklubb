import type { CollectionConfig } from 'payload'

export const Members: CollectionConfig = {
  slug: 'members',
  auth: true,
  admin: {
    useAsTitle: 'email',
    group: 'Medlemmer',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Navn',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rolle',
      required: true,
      hasMany: true,
      defaultValue: 'member',
      options: [
        { label: 'Medlem̈́', value: 'member' },
        { label: 'Nyhetsredaktør', value: 'news_admin' },
      ],
    },
  ],
}
