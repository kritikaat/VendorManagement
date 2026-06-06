import { z } from 'zod';
import { USER_ROLES } from '@/types/auth.types';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_REGEX = /^[0-9]{10}$/;

const vendorProfileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  category: z.string().min(1, 'Category is required'),
  GSTNumber: z
    .string()
    .regex(GST_REGEX, 'Enter a valid 15-character GST number'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
});

export const registerSchema = z
  .object({
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
    vendorProfile: vendorProfileSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role !== USER_ROLES.VENDOR) return;

    if (!data.phone || !PHONE_REGEX.test(data.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Phone must be a 10-digit number',
        path: ['phone'],
      });
    }

    if (!data.vendorProfile) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Company details are required for vendor registration',
        path: ['vendorProfile'],
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
