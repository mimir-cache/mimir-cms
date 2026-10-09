import type { AdminViewServerProps } from 'payload'

import { Gutter } from '@payloadcms/ui'
import React from 'react'

type TenantMetrics = {
  total_requests: number
  exact_hits: number
  semantic_hits: number
  cache_misses: number
  low_confidence: number
  collision_alerts: number
  admission_skips: number
  evictions: number
  hit_rate: number
  tokens_used: number
  tokens_saved: number
  cost_saved_usd: number
  avg_latency_ms: number
}

type SecurityAlert = {
  tenant_id: string
  alert_type: string
  details: Record<string, unknown>
  created_at: number
}

async function fetchBackend<T>(path: string): Promise<{ data: T | null; error: string | null }> {
  const baseUrl = process.env.MIMIR_BACKEND_URL || 'http://localhost:8000'
  const adminKey = process.env.MIMIR_ADMIN_API_KEY

  if (!adminKey) {
    return { data: null, error: 'MIMIR_ADMIN_API_KEY is not set in the CMS environment.' }
  }

  try {
    const res = await fetch(`${baseUrl}${path}`, {
      cache: 'no-store',
      headers: { Authorization: `Bearer ${adminKey}` },
    })
    if (!res.ok) {
      return { data: null, error: `Backend returned ${res.status} for ${path}` }
    }
    return { data: (await res.json()) as T, error: null }
  } catch (err) {
    return {
      data: null,
      error: `Could not reach MIMIR backend at ${baseUrl}: ${(err as Error).message}`,
    }
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--theme-elevation-50)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 6,
        minWidth: 160,
        padding: '12px 16px',
      }}
    >
      <div style={{ color: 'var(--theme-elevation-500)', fontSize: 12, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
    </div>
  )
}

function formatPct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

export default async function MimirDashboardView(_props: AdminViewServerProps) {
  const [metricsResult, alertsResult] = await Promise.all([
    fetchBackend<Record<string, TenantMetrics>>('/v1/admin/metrics'),
    fetchBackend<SecurityAlert[]>('/v1/admin/alerts?limit=25'),
  ])

  const error = metricsResult.error || alertsResult.error
  const metrics = metricsResult.data || {}
  const alerts = alertsResult.data || []

  const tenantIds = Object.keys(metrics)
  const totals = tenantIds.reduce(
    (acc, id) => {
      const m = metrics[id]
      acc.total_requests += m.total_requests
      acc.tokens_saved += m.tokens_saved
      acc.cost_saved_usd += m.cost_saved_usd
      acc.exact_hits += m.exact_hits
      acc.semantic_hits += m.semantic_hits
      return acc
    },
    { cost_saved_usd: 0, exact_hits: 0, semantic_hits: 0, tokens_saved: 0, total_requests: 0 },
  )
  const overallHitRate =
    totals.total_requests > 0 ? (totals.exact_hits + totals.semantic_hits) / totals.total_requests : 0

  return (
    <Gutter>
      <h1>MIMIR — Live Cache Analytics</h1>
      <p style={{ color: 'var(--theme-elevation-500)' }}>
        Live metrics pulled from the FastAPI middleware ({process.env.MIMIR_BACKEND_URL || 'http://localhost:8000'}).
        This page fetches on every request — reload to refresh.
      </p>

      {error && (
        <div
          style={{
            background: 'var(--theme-error-100)',
            border: '1px solid var(--theme-error-300)',
            borderRadius: 6,
            marginBottom: 20,
            padding: 16,
          }}
        >
          <strong>Could not load live data:</strong> {error}
          <div style={{ fontSize: 13, marginTop: 6 }}>
            Set <code>MIMIR_ADMIN_API_KEY</code> (matching the backend&apos;s <code>MIMIR_ADMIN_API_KEY</code> env
            var) and <code>MIMIR_BACKEND_URL</code> in the CMS <code>.env</code>, then restart the CMS dev server.
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 28 }}>
        <StatCard label="Total Requests" value={totals.total_requests.toLocaleString()} />
        <StatCard label="Overall Hit Rate" value={formatPct(overallHitRate)} />
        <StatCard label="Tokens Saved" value={totals.tokens_saved.toLocaleString()} />
        <StatCard label="Cost Saved" value={`$${totals.cost_saved_usd.toFixed(4)}`} />
        <StatCard label="Active Tenants" value={String(tenantIds.length)} />
      </div>

      <h2>Per-Tenant Breakdown</h2>
      {tenantIds.length === 0 ? (
        <p>No requests recorded yet — send a query to <code>/v1/cache/query</code> to see data here.</p>
      ) : (
        <table style={{ borderCollapse: 'collapse', marginBottom: 32, width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--theme-elevation-150)', textAlign: 'left' }}>
              {[
                'Tenant',
                'Requests',
                'Hit Rate',
                'Exact Hits',
                'Semantic Hits',
                'Misses',
                'Collisions',
                'Evictions',
                'Tokens Saved',
                'Cost Saved',
                'Avg Latency',
              ].map((h) => (
                <th key={h} style={{ padding: '8px 12px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenantIds.map((id) => {
              const m = metrics[id]
              return (
                <tr key={id} style={{ borderBottom: '1px solid var(--theme-elevation-100)' }}>
                  <td style={{ padding: '8px 12px' }}>
                    <strong>{id}</strong>
                  </td>
                  <td style={{ padding: '8px 12px' }}>{m.total_requests}</td>
                  <td style={{ padding: '8px 12px' }}>{formatPct(m.hit_rate)}</td>
                  <td style={{ padding: '8px 12px' }}>{m.exact_hits}</td>
                  <td style={{ padding: '8px 12px' }}>{m.semantic_hits}</td>
                  <td style={{ padding: '8px 12px' }}>{m.cache_misses}</td>
                  <td style={{ padding: '8px 12px' }}>{m.collision_alerts}</td>
                  <td style={{ padding: '8px 12px' }}>{m.evictions}</td>
                  <td style={{ padding: '8px 12px' }}>{m.tokens_saved}</td>
                  <td style={{ padding: '8px 12px' }}>${m.cost_saved_usd.toFixed(4)}</td>
                  <td style={{ padding: '8px 12px' }}>{m.avg_latency_ms.toFixed(1)}ms</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      <h2>Security Alert Feed</h2>
      {alerts.length === 0 ? (
        <p>No security alerts recorded.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {alerts.map((a, i) => (
            <li
              key={i}
              style={{
                background: 'var(--theme-elevation-50)',
                border: '1px solid var(--theme-elevation-150)',
                borderRadius: 6,
                marginBottom: 8,
                padding: 12,
              }}
            >
              <div>
                <strong>{a.alert_type.toUpperCase()}</strong> — tenant <code>{a.tenant_id}</code>{' '}
                <span style={{ color: 'var(--theme-elevation-500)' }}>
                  {new Date(a.created_at * 1000).toLocaleString()}
                </span>
              </div>
              <pre style={{ fontSize: 12, margin: '6px 0 0', whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(a.details, null, 2)}
              </pre>
            </li>
          ))}
        </ul>
      )}
    </Gutter>
  )
}
