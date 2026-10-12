import type { CollectionConfig } from 'payload'

import { authenticated, authenticatedOrPublished } from '@/collections/access'
import { emptyToNull } from '@/lib/cms/empty-to-null'

export const Faqs: CollectionConfig = {
  slug: 'faqs',
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    defaultColumns: ['question', 'updatedAt'],
    useAsTitle: 'question',
  },
  fields: [
    {
      name: 'question',
      type: 'text',
      required: true,
    },
    {
      name: 'answer',
      type: 'textarea',
      required: true,
    },
    {
      name: 'legacyId',
      type: 'text',
      unique: true,
      index: true,
      hooks: {
        beforeValidate: [emptyToNull],
      },
    },
    {
      name: 'sourceUrl',
      type: 'text',
    },
  ],
  versions: {
    drafts: {
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
