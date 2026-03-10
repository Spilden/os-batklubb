import type { CollectionConfig } from 'payload'

export const News: CollectionConfig = {
  slug: 'news',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        placeholder: 'Artikkelens tittel'
      },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      label: 'Lenkeadresse',
      admin: {
        placeholder: 'Tittel blir konvertert til lenkeadresse automatisk',
        description: 'Velg hva som skal vises som lenkeadresse',
      },
      hooks: {
        beforeChange: [
          ({ data }) => {
            if (data?.title) {
              return data.title
                .toLowerCase()
                .replace(/\s+/g, '-')       // mellomrom til bindestrek
                .replace(/æ/g, 'ae')      // norske tegn
                .replace(/ø/g, 'oe')
                .replace(/å/g, 'aa')
                .replace(/[^a-z0-9-]/g, '') // fjern spesialtegn
            }
          },
        ],
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: false,
      admin: {
        description: 'Dette feltet er for tekst som skal vise på oversikten over artikler, på nyhetssiden.'
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Dette feltet er hovedinnholdet i artikkelen. Formateringen her blir brukt i artikkelen'
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'publishedAt',
      type: 'date',
      defaultValue: () => new Date().toISOString(),
      required: true,
      admin: {
        description: 'Velg dato for publisering av artikkel, dagens dato er valgt som standard'
      },
    }
  ],
}