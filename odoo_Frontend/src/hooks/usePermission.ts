import {
  hasAnyPermission,
  hasPermission,
  type Permission,
} from '@/constants/permissions';
import { useAuth } from '@/hooks/useAuth';

export function usePermission() {
  const { user } = useAuth();
  const role = user?.role;

  const can = (permission: Permission) => hasPermission(role, permission);
  const canAny = (permissions: Permission[]) => hasAnyPermission(role, permissions);

  return { can, canAny, role };
}
