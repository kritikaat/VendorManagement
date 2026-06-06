import type { UserRole } from '@/types/auth.types';
import { USER_ROLES } from '@/types/auth.types';

export interface DemoUserProfile {
  firstName: string;
  lastName: string;
  role: UserRole;
}

/** Static demo accounts — password for all: Password@1 */
export const DEMO_USERS: Record<string, DemoUserProfile> = {
  'admin@vendorbridge.com': {
    firstName: 'System',
    lastName: 'Admin',
    role: USER_ROLES.ADMIN,
  },
  'officer@vendorbridge.com': {
    firstName: 'Priya',
    lastName: 'Sharma',
    role: USER_ROLES.PROCUREMENT_OFFICER,
  },
  'approver@vendorbridge.com': {
    firstName: 'Rahul',
    lastName: 'Mehta',
    role: USER_ROLES.APPROVER,
  },
  'vendor@vendorbridge.com': {
    firstName: 'Infra',
    lastName: 'Supplies',
    role: USER_ROLES.VENDOR,
  },
};

export const DEMO_PASSWORD = 'Password@1';

export const DEMO_ACCOUNT_LIST = Object.entries(DEMO_USERS).map(([email, profile]) => ({
  email,
  password: DEMO_PASSWORD,
  role: profile.role,
  name: `${profile.firstName} ${profile.lastName}`,
}));
