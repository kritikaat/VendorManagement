import { z } from 'zod';
import { USER_ROLES } from '@/types/auth.types';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Include at least one uppercase letter')
    .regex(/[a-z]/, 'Include at least one lowercase letter')
    .regex(/[0-9]/, 'Include at least one number')
    .regex(/[^A-Za-z0-9]/, 'Include at least one special character'),
  role: z
    .enum([
      USER_ROLES.ADMIN,
      USER_ROLES.PROCUREMENT_OFFICER,
      USER_ROLES.APPROVER,
      USER_ROLES.VENDOR,
    ])
    .optional(),
  country: z.string().optional(),
  additionalInfo: z.string().optional(),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
