import type { CollectionConfig } from 'payload'

import { isTenantAdminOrAbove, tenantScopedRead } from '../access'

/**
 * Prompt version tags — mirrors the `prompt_versions` table (§10).
 * Bumping a version invalidates all cache entries carrying the old tag.
 */
export const PromptVersions: CollectionConfig = {
  slug: 'prompt-versions',
  access: {
    create: isTenantAdminOrAbove,
    delete: isTenantAdminOrAbove,
    read: tenantScopedRead,
    update: isTenantAdminOrAbove,
  },
  admin: {
    defaultColumns: ['versionTag', 'tenant', 'invalidatedAt'],
    useAsTitle: 'versionTag',
  },
  fields: [
    {
      name: 'tenant',
      type: 'relationship',
      index: true,
      relationTo: 'tenants',
      required: true,
    },
    {
      name: 'versionTag',
      type: 'text',
      index: true,
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'invalidatedAt',
      type: 'date',
      admin: {
        description: 'Set when this version was invalidated — entries with this tag are purged.',
      },
    },
  ],
  timestamps: true,
}
