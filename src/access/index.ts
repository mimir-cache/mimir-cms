import type { Access, FieldAccess, PayloadRequest } from 'payload'

import type { User } from '../payload-types'

export type Role = 'super_admin' | 'tenant_admin' | 'viewer'

const getUser = (req: PayloadRequest): null | User => (req.user as null | User) ?? null

export const isSuperAdmin: Access = ({ req }) => getUser(req)?.role === 'super_admin'

export const isSuperAdminField: FieldAccess = ({ req }) => getUser(req)?.role === 'super_admin'

export const isTenantAdminOrAbove: Access = ({ req }) => {
  const role = getUser(req)?.role
  return role === 'super_admin' || role === 'tenant_admin'
}

/**
 * Tenant isolation for reads: super admins see everything, all other users only
 * see documents belonging to their own tenant (the Payload-side counterpart of
 * the middleware's per-tenant namespace isolation — Contribution 4).
 */
export const tenantScopedRead: Access = ({ req }) => {
  const user = getUser(req)
  if (!user) return false
  if (user.role === 'super_admin') return true
  const tenantId = typeof user.tenant === 'object' ? user.tenant?.id : user.tenant
  if (!tenantId) return false
  return { tenant: { equals: tenantId } }
}

/** Writes restricted to super admins — operational data is written by the middleware. */
export const superAdminWritesOnly = {
  create: isSuperAdmin,
  delete: isSuperAdmin,
  read: tenantScopedRead,
  update: isSuperAdmin,
}
