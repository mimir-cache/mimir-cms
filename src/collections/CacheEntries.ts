import type { CollectionConfig } from 'payload'

import { superAdminWritesOnly } from '../access'

/**
 * Cold cache archive — mirrors the `cache_entries` table (§10). Hot entries
 * live in Redis/FAISS inside the middleware; this collection is the browsable
 * archive synced for the dashboard's cache management panel. Embeddings stay
 * in the vector index and are intentionally not exposed here.
 */
export const CacheEntries: CollectionConfig = {
  slug: 'cache-entries',
  access: superAdminWritesOnly,
  admin: {
    defaultColumns: ['normalizedPrompt', 'tenant', 'accessCount', 'tokenCount', 'isActive'],
    description: 'Cold archive of cache entries synced from the middleware.',
    useAsTitle: 'normalizedPrompt',
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
      name: 'cacheKey',
      type: 'text',
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'promptHash',
      type: 'text',
      index: true,
    },
    {
      name: 'normalizedPrompt',
      type: 'textarea',
      required: true,
    },
    {
      name: 'responseText',
      type: 'textarea',
      required: true,
    },
    {
      name: 'tokenCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'modelUsed',
      type: 'text',
    },
    {
      name: 'contextHash',
      type: 'text',
      admin: {
        description: 'Hash of the conversation context used in the cache key (Contribution 3).',
      },
    },
    {
      name: 'accessCount',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'lastAccessedAt',
      type: 'date',
    },
    {
      name: 'semanticUniqueness',
      type: 'number',
      admin: { step: 0.0001 },
      max: 1,
      min: 0,
    },
    {
      name: 'admissionScore',
      type: 'number',
      admin: {
        description: 'Reuse probability predicted by the admission classifier (Contribution 1).',
        step: 0.0001,
      },
      max: 1,
      min: 0,
    },
    {
      name: 'evictionScore',
      type: 'number',
      admin: {
        description: 'Learning-based eviction score — lowest evicted first (Contribution 2).',
        step: 0.0001,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'ttlExpiresAt',
      type: 'date',
    },
    {
      name: 'promptVersionTag',
      type: 'text',
      admin: {
        description: 'Invalidation tag — bump the prompt version to invalidate related entries.',
      },
      index: true,
    },
  ],
  timestamps: true,
}
