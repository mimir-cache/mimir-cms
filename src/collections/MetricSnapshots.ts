import type { CollectionConfig } from 'payload'

import { superAdminWritesOnly } from '../access'

/**
 * Hourly aggregated metrics — mirrors the `metric_snapshots` table (§10).
 * Computed by the middleware's background aggregation worker; drives the
 * dashboard's hit-rate, token-savings, and latency charts.
 */
export const MetricSnapshots: CollectionConfig = {
  slug: 'metric-snapshots',
  access: superAdminWritesOnly,
  admin: {
    defaultColumns: ['tenant', 'snapshotHour', 'totalRequests', 'tokensSaved', 'costSavedUsd'],
    description: 'Hourly aggregates powering the analytics dashboard.',
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
      name: 'snapshotHour',
      type: 'date',
      index: true,
      required: true,
    },
    { name: 'totalRequests', type: 'number', defaultValue: 0 },
    { name: 'exactHits', type: 'number', defaultValue: 0 },
    { name: 'semanticHits', type: 'number', defaultValue: 0 },
    { name: 'cacheMisses', type: 'number', defaultValue: 0 },
    { name: 'collisionAlerts', type: 'number', defaultValue: 0 },
    { name: 'tokensSaved', type: 'number', defaultValue: 0 },
    {
      name: 'costSavedUsd',
      type: 'number',
      admin: { step: 0.0001 },
      defaultValue: 0,
    },
    { name: 'avgLatencyMs', type: 'number' },
    { name: 'p99LatencyMs', type: 'number' },
    { name: 'cacheEntryCount', type: 'number', defaultValue: 0 },
    { name: 'storageBytes', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
}
