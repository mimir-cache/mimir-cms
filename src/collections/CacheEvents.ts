import type { CollectionConfig } from 'payload'

import { superAdminWritesOnly } from '../access'

/** Raw hit/miss/collision event log — mirrors the `cache_events` table (§10). */
export const CacheEvents: CollectionConfig = {
  slug: 'cache-events',
  access: superAdminWritesOnly,
  admin: {
    defaultColumns: ['eventType', 'tenant', 'similarityScore', 'latencyMs', 'createdAt'],
    description: 'Per-request cache events synced from the middleware metrics stream.',
    useAsTitle: 'eventType',
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
      name: 'eventType',
      type: 'select',
      index: true,
      options: [
        { label: 'Exact Hit', value: 'exact_hit' },
        { label: 'Semantic Hit', value: 'semantic_hit' },
        { label: 'Cache Miss', value: 'cache_miss' },
        { label: 'Low Confidence', value: 'low_confidence' },
        { label: 'Collision Suspect', value: 'collision_suspect' },
        { label: 'Eviction', value: 'eviction' },
        { label: 'Admission Skip', value: 'admission_skip' },
        { label: 'Prefetch Hit', value: 'prefetch_hit' },
      ],
      required: true,
    },
    {
      name: 'similarityScore',
      type: 'number',
      admin: { step: 0.0001 },
    },
    {
      name: 'latencyMs',
      type: 'number',
    },
    {
      name: 'tokensUsed',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'tokensSaved',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'llmCostUsd',
      type: 'number',
      admin: { step: 0.000001 },
    },
    {
      name: 'cacheCostUsd',
      type: 'number',
      admin: { step: 0.000001 },
    },
    {
      name: 'sessionId',
      type: 'text',
      index: true,
    },
  ],
  timestamps: true,
}
