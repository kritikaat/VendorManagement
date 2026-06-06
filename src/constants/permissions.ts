import { USER_ROLES, type UserRole } from '@/types/auth.types';

export const PERMISSIONS = {
  'vendor:create': [USER_ROLES.ADMIN],
  'vendor:read': [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER],
  'rfq:create': [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER],
  'rfq:read': [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.APPROVER,
    USER_ROLES.VENDOR,
  ],
  'quotation:submit': [USER_ROLES.VENDOR],
  'quotation:compare': [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER],
  'approval:view': [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER, USER_ROLES.APPROVER],
  'approval:approve': [USER_ROLES.ADMIN, USER_ROLES.APPROVER],
  'po:read': [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.APPROVER,
    USER_ROLES.VENDOR,
  ],
  'invoice:read': [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.APPROVER,
    USER_ROLES.VENDOR,
  ],
  'invoice:mark-paid': [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER],
  'reports:view': [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER, USER_ROLES.APPROVER],
  'activity:read': [
    USER_ROLES.ADMIN,
    USER_ROLES.PROCUREMENT_OFFICER,
    USER_ROLES.APPROVER,
    USER_ROLES.VENDOR,
  ],
} as const;

export type Permission = keyof typeof PERMISSIONS;

export function hasPermission(role: UserRole | undefined, permission: Permission): boolean {
  if (!role) return false;
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(role);
}

export function hasAnyPermission(
  role: UserRole | undefined,
  permissions: Permission[],
): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
