import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import {
  hasAnyPermission,
  hasPermission,
  type Permission,
} from '@/constants/permissions';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';

export function AuthenticatedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout />;
}

interface PermissionRouteProps {
  children: ReactNode;
  permission: Permission | Permission[];
}

export function PermissionRoute({ children, permission }: PermissionRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const allowed = Array.isArray(permission)
    ? hasAnyPermission(user.role, permission)
    : hasPermission(user.role, permission);

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

/** @deprecated Use PermissionRoute — kept for backward compatibility */
export function RoleRoute({
  children,
  roles,
}: {
  children: ReactNode;
  roles: string[];
}) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!roles.includes('*') && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
