import type { Block, Field } from 'payload'

import { emptyToNull } from '@/lib/cms/empty-to-null'
import { cmsPathFromSlug, normalizeCmsPath } from '@/lib/cms/path'

export const routingFields: Field[] = [
  {
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    hooks: {
      beforeValidate: [emptyToNull],
    },
  },
  {
    name: 'path',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      description: 'Public path without a trailing slash. Home is /.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (value === '') return null
          if (typeof value === 'string' && value.trim()) {
            return normalizeCmsPath(value)
          }
          if (typeof data?.slug === 'string' && data.slug) {
            return cmsPathFromSlug(data.slug)
          }
          return null
        },
      ],
    },
  },
  {
    name: 'legacyId',
    type: 'text',
    unique: true,
    index: true,
    hooks: {
      beforeValidate: [emptyToNull],
    },
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'sourceUrl',
    type: 'text',
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'sourceUpdatedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
    },
  },
]

export const seoControlFields: Field[] = [
  {
    name: 'canonicalUrl',
    type: 'text',
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'noIndex',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'noFollow',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'excludeFromSitemap',
    type: 'checkbox',
    defaultValue: false,
    admin: {
      position: 'sidebar',
    },
  },
]

export const HeroBlock: Block = {
  slug: 'hero',
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'subheading',
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}

export const ContentBlock: Block = {
  slug: 'content',
  fields: [
    {
      name: 'body',
      type: 'richText',
    },
  ],
}

export const MediaBlock: Block = {
  slug: 'mediaBlock',
  fields: [
    {
      name: 'media',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'caption',
      type: 'text',
    },
  ],
}

export const CtaBlock: Block = {
  slug: 'cta',
  fields: [
    {
      name: 'heading',
      type: 'text',
    },
    {
      name: 'body',
      type: 'textarea',
    },
    {
      name: 'label',
      type: 'text',
    },
    {
      name: 'href',
      type: 'text',
    },
  ],
}
