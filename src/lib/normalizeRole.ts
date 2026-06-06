import { USER_ROLES, type UserRole } from '@/types/auth.types';

const ROLE_MAP: Record<string, UserRole> = {
  admin: USER_ROLES.ADMIN,
  super_admin: USER_ROLES.ADMIN,
  procurement_officer: USER_ROLES.PROCUREMENT_OFFICER,
  approver: USER_ROLES.APPROVER,
  manager: USER_ROLES.APPROVER,
  vendor: USER_ROLES.VENDOR,
};

export function normalizeRole(role: string): UserRole {
  return ROLE_MAP[role] ?? USER_ROLES.PROCUREMENT_OFFICER;
}
