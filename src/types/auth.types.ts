export const USER_ROLES = {
  ADMIN: 'admin',
  PROCUREMENT_OFFICER: 'procurement_officer',
  APPROVER: 'approver',
  VENDOR: 'vendor',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  phone?: string;
  country?: string;
  additionalInfo?: string;
}

export interface AuthSession {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  role?: UserRole;
  country?: string;
  additionalInfo?: string;
}
