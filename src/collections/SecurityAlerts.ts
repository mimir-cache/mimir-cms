import type { CollectionConfig } from 'payload'

import { isTenantAdminOrAbove, superAdminWritesOnly } from '../access'

/** Security alert feed — mirrors the `security_alerts` table (§10, Contribution 5). */
export const SecurityAlerts: CollectionConfig = {
  slug: 'security-alerts',
  access: {
    ...superAdminWritesOnly,
    // Tenant admins may acknowledge (resolve) their own alerts.
    update: isTenantAdminOrAbove,
  },
  admin: {
    defaultColumns: ['alertType', 'tenant', 'resolved', 'createdAt'],
    description: 'Collision-attack and probe-pattern alerts from the middleware defense layer.',
    useAsTitle: 'alertType',
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
      name: 'alertType',
      type: 'select',
      index: true,
      options: [
        { label: 'Collision Suspect', value: 'collision_suspect' },
        { label: 'Probe Pattern', value: 'probe_pattern' },
        { label: 'Anomaly', value: 'anomaly' },
      ],
      required: true,
    },
    {
      name: 'details',
      type: 'json',
      admin: {
        description: 'Alert payload: matched prompts, similarity score, query counts, etc.',
      },
    },
    {
      name: 'sourceIp',
      type: 'text',
    },
    {
      name: 'resolved',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
