import type { GlobalConfig } from 'payload'

export const SlippSettings: GlobalConfig = {
  slug: 'slipp-settings',
  fields: [
    {
      name: 'highSeasons',
      type: 'array',
      label: 'Høysesonger',
      fields: [
        {
          name: 'highSeasonStart',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'highSeasonEnd',
          type: 'date',
          required: true,
          admin: { date: { pickerAppearance: 'dayOnly' } },
        },
        {
          name: 'highSeasonOpenDate',
          type: 'date',
          required: true,
          admin: {
            date: { pickerAppearance: 'dayOnly' },
            description: 'Brukere kan ikke booke høysesong før denne datoen',
          },
        },
      ],
    },
  ],
}
