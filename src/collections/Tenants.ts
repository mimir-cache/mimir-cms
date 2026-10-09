import type { CollectionConfig } from 'payload'

import { isSuperAdmin } from '../access'

/**
 * Tenant registry — mirrors the `tenants` table in system_architecture.md §10.
 * Cache behaviour is tunable per tenant; the middleware reads these values via
 * the REST API (`/api/tenants`) and applies them to its in-memory registry.
 */
export const Tenants: CollectionConfig = {
  slug: 'tenants',
  access: {
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: ({ req }) => {
      const user = req.user
      if (!user) return false
      if (user.role === 'super_admin') return true
      const tenantId = typeof user.tenant === 'object' ? user.tenant?.id : user.tenant
      if (!tenantId) return false
      return { id: { equals: tenantId } }
    },
    update: isSuperAdmin,
  },
  admin: {
    defaultColumns: ['name', 'tenantKey', 'plan', 'isActive'],
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'tenantKey',
      type: 'text',
      admin: {
        description: 'Stable identifier used by the middleware (e.g. tenant_a).',
      },
      index: true,
      required: true,
      unique: true,
    },
    {
      name: 'apiKeyHash',
      type: 'text',
      admin: {
        description: 'SHA-256 hash of the tenant API key. Plaintext keys are never stored.',
        position: 'sidebar',
      },
    },
    {
      name: 'plan',
      type: 'select',
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'cacheConfig',
      type: 'group',
      admin: {
        description: 'Per-tenant cache tuning applied by the middleware.',
      },
      fields: [
        {
          name: 'similarityThreshold',
          type: 'number',
          admin: { step: 0.001 },
          defaultValue: 0.92,
          max: 1,
          min: 0.5,
        },
        {
          name: 'ttlSeconds',
          type: 'number',
          defaultValue: 86400,
          min: 60,
        },
        {
          name: 'maxCacheEntries',
          type: 'number',
          defaultValue: 10000,
          min: 10,
        },
        {
          name: 'admissionThreshold',
          type: 'number',
          admin: { step: 0.01 },
          defaultValue: 0.5,
          max: 1,
          min: 0,
        },
        {
          name: 'collisionCeiling',
          type: 'number',
          admin: { step: 0.0001 },
          defaultValue: 0.999,
          max: 1,
          min: 0.9,
        },
        {
          name: 'contextWindowTurns',
          type: 'number',
          defaultValue: 3,
          max: 10,
          min: 0,
        },
        {
          name: 'enablePrefetch',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
  timestamps: true,
}
