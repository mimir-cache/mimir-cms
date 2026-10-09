import config from '@/payload.config'

import { describe, expect, it } from 'vitest'

// Config-level tests — no database required. Full API integration tests run
// against the docker-compose Postgres in CI (see README).
describe('payload config', () => {
  it('registers all MIMIR collections', async () => {
    const payloadConfig = await config

    const slugs = payloadConfig.collections.map((collection) => collection.slug)

    expect(slugs).toEqual(
      expect.arrayContaining([
        'users',
        'tenants',
        'cache-entries',
        'cache-events',
        'metric-snapshots',
        'security-alerts',
        'prompt-versions',
      ]),
    )
  })

  it('uses the users collection for admin auth', async () => {
    const payloadConfig = await config

    expect(payloadConfig.admin.user).toBe('users')
  })
})
