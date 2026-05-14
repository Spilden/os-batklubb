import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
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
    },
    {
      name: 'adminComment',
      type: 'textarea',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: ['draft', 'published', 'cancelled'],
    },
  ],
}
