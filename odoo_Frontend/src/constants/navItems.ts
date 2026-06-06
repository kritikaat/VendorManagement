import {
  Activity,
  BarChart3,
  Building2,
  CheckCircle,
  FileText,
  LayoutDashboard,
  Receipt,
  ShoppingCart,
  type LucideIcon,
} from 'lucide-react';
import { USER_ROLES } from '@/types/auth.types';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  roles: string[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['*'] },
  {
    label: 'Vendors',
    path: '/vendors',
    icon: Building2,
    roles: [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER],
  },
  {
    label: "RFQ's",
    path: '/rfqs',
    icon: FileText,
    roles: [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER],
  },
  { label: 'Quotations', path: '/quotations', icon: Receipt, roles: ['*'] },
  {
    label: 'Approvals',
    path: '/approvals',
    icon: CheckCircle,
    roles: [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER, USER_ROLES.APPROVER],
  },
  { label: 'Purchase orders', path: '/purchase-orders', icon: ShoppingCart, roles: ['*'] },
  { label: 'Invoices', path: '/invoices', icon: FileText, roles: ['*'] },
  {
    label: 'Reports',
    path: '/reports',
    icon: BarChart3,
    roles: [USER_ROLES.ADMIN, USER_ROLES.PROCUREMENT_OFFICER, USER_ROLES.APPROVER],
  },
  { label: 'Activity', path: '/activity', icon: Activity, roles: ['*'] },
];

export function getNavItemsForRole(role: string): NavItem[] {
  return NAV_ITEMS.filter(
    (item) => item.roles.includes('*') || item.roles.includes(role),
  );
}
