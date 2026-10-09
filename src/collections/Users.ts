import type { CollectionConfig } from 'payload'

import { isSuperAdmin, isSuperAdminField } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: () => true,
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'super_admin') return true
      return { id: { equals: req.user.id } }
    },
    update: ({ req }) => {
      if (!req.user) return false
      if (req.user.role === 'super_admin') return true
      return { id: { equals: req.user.id } }
    },
  },
  admin: {
    defaultColumns: ['email', 'name', 'role', 'tenant'],
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      access: {
        update: isSuperAdminField,
      },
      defaultValue: 'viewer',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Tenant Admin', value: 'tenant_admin' },
        { label: 'Viewer', value: 'viewer' },
      ],
      required: true,
    },
    {
      name: 'tenant',
      type: 'relationship',
      access: {
        update: isSuperAdminField,
      },
      admin: {
        condition: (data) => data?.role !== 'super_admin',
        description: 'Tenant this user belongs to. Required for all non super-admin users.',
      },
      relationTo: 'tenants',
    },
  ],
  timestamps: true,
}
