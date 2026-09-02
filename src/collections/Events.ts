import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  access: {
    create: ({ req: { user } }) => Boolean(user),
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { user: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.roles?.includes('admin')) return true
      return { user: { equals: user.id } }
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'color',
      type: 'text',
      admin: { components: { Field: 'src/components/ColorPickerField#ColorPickerField' } },
    },
    {
      name: 'startTime',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'endTime',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      defaultValue: ({ user }) => user?.id,
    },
    {
      name: 'comment',
      type: 'textarea',
      access: {
        read: ({ req: { user }, doc }) => {
          if (!user) return false
          if (user.roles?.includes('admin')) return true
          const ownerId = typeof doc?.user === 'object' ? doc?.user?.id : doc?.user
          return ownerId === user.id
        },
      },
    },
    {
      name: 'adminComment',
      type: 'textarea',
      access: {
        read: ({ req: { user }, doc }) => {
          if (!user) return false
          if (user.roles?.includes('admin')) return true
          const ownerId = typeof doc?.user === 'object' ? doc?.user?.id : doc?.user
          return ownerId === user.id
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: ['draft', 'published', 'cancelled'],
    },
  ],
}
