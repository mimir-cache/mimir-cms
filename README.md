# MIMIR CMS — Analytics Dashboard

Payload CMS (Next.js) application providing the admin dashboard for the MIMIR
semantic cache middleware: tenant management, cache entry browsing, event and
metric analytics, and the security alert feed.

Scaffolded from the official Payload `blank` template and customised with the
MIMIR data model (see `system_architecture.md` §10 at the repository root).

## Collections

| Collection         | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `users`            | Dashboard users with roles: super_admin / tenant_admin / viewer |
| `tenants`          | Tenant registry + per-tenant cache tuning (thresholds, TTL)    |
| `cache-entries`    | Cold archive of cached responses synced from the middleware    |
| `cache-events`     | Per-request hit/miss/collision event log                       |
| `metric-snapshots` | Hourly aggregates for hit-rate / savings / latency charts      |
| `security-alerts`  | Collision-attack and probe-pattern alert feed                  |
| `prompt-versions`  | Version tags for bulk cache invalidation                       |

Access control mirrors the middleware's tenant isolation: non-super-admin users
only ever see documents belonging to their own tenant.

## Quick start

```bash
cd mimir/cms
docker compose up -d          # local PostgreSQL on :5432
cp .env.example .env          # set PAYLOAD_SECRET to a long random string
pnpm install                  # or npm install
pnpm dev
```

Open http://localhost:3000/admin and create the first (super admin) user.

## Scripts

- `pnpm dev` — dev server
- `pnpm build` / `pnpm start` — production build and serve
- `pnpm generate:types` — regenerate `src/payload-types.ts` after schema changes
- `pnpm typecheck` — TypeScript check
- `pnpm lint` — ESLint
- `pnpm test:int` — Vitest config-level tests (no DB needed)

## How the middleware connects

The FastAPI middleware (in `mimir/backend`) is the writer of operational data.
It syncs cache entries, events, snapshots, and alerts into this CMS via the
Payload REST API (`/api/cache-entries`, `/api/cache-events`, ...) using a
super-admin API key. Tenant admins then manage thresholds and review analytics
here, and the middleware picks up config changes from `/api/tenants`.
