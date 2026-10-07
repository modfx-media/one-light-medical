import type { CollectionConfig } from 'payload'

import { authenticated, authenticatedOrPublished } from '@/collections/access'
import {
  ContentBlock,
  CtaBlock,
  HeroBlock,
  MediaBlock,
  routingFields,
  seoControlFields,
} from '@/collections/fields'
import { previewFromPath } from '@/lib/cms/preview'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['title', 'path', 'updatedAt'],
    livePreview: {
      url: ({ data }) => previewFromPath(data?.path, data?.slug),
    },
    preview: (data) => previewFromPath(data?.path, data?.slug),
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'h1',
      type: 'text',
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [HeroBlock, ContentBlock, MediaBlock, CtaBlock],
    },
    ...routingFields,
    ...seoControlFields,
  ],
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
