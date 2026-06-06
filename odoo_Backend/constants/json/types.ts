export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  STAFF: 'staff',
  USER: 'user',
  GUEST: 'guest',
  // Procurement-specific roles
  PROCUREMENT_OFFICER: 'procurement_officer',
  VENDOR: 'vendor',
  MANAGER: 'manager',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];
