import type { CollectionConfig } from 'payload'

export const SlippSlots: CollectionConfig = {
  slug: 'slipp-slots',
  admin: {
    useAsTitle: 'startTime',
    defaultColumns: ['startTime', 'endTime', 'bookedBy'],
  },
  fields: [
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
      name: 'bookedBy',
      type: 'relationship',
      relationTo: 'users',
    },
    {
      name: 'comment',
      type: 'textarea',
    },
  ],
}