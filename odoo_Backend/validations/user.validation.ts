import { Joi } from 'express-validation';
import { ROLES } from '../constants/json/types.js';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{8,}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_REGEX = /^[0-9]{10}$/;

const vendorProfileSchema = Joi.object({
  companyName: Joi.string().required(),
  category: Joi.string().required(),
  GSTNumber: Joi.string().regex(GST_REGEX).required().messages({
    'string.pattern.base': 'GSTNumber must be a valid 15-character Indian GST number',
  }),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
});

export const userValidation = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  login: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  },

  signup: {
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().lowercase().required(),
      password: Joi.string().regex(PASSWORD_REGEX).required().messages({
        'string.pattern.base':
          'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
      }),
      role: Joi.string()
        .valid(...Object.values(ROLES))
        .optional(),
      photo: Joi.string().allow('').optional(),
      phone: Joi.when('role', {
        is: ROLES.VENDOR,
        then: Joi.string().regex(PHONE_REGEX).required().messages({
          'string.pattern.base': 'Phone must be a 10-digit number for vendor registration',
        }),
        otherwise: Joi.string().allow('').optional(),
      }),
      country: Joi.string().allow('').optional(),
      additionalInfo: Joi.string().allow('').optional(),
      vendorProfile: Joi.when('role', {
        is: ROLES.VENDOR,
        then: vendorProfileSchema.required(),
        otherwise: Joi.forbidden(),
      }),
    }),
  },

  forgotPassword: {
    body: Joi.object({
      email: Joi.string().email().required(),
    }),
  },

  verifyOtp: {
    body: Joi.object({
      email: Joi.string().email().required(),
      otp: Joi.string().length(6).pattern(/^\d{6}$/).required().messages({
        'string.length': 'OTP must be exactly 6 digits.',
        'string.pattern.base': 'OTP must contain only digits.',
      }),
    }),
  },

  resetPassword: {
    body: Joi.object({
      resetToken: Joi.string().required(),
      password: Joi.string().regex(PASSWORD_REGEX).required().messages({
        'string.pattern.base':
          'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
      }),
    }),
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().regex(PASSWORD_REGEX).required().messages({
        'string.pattern.base':
          'Password must be at least 8 characters with 1 uppercase, 1 number, and 1 special character',
      }),
    }),
  },

  // ─── User CRUD ─────────────────────────────────────────────────────────────
  create: {
    body: Joi.object({
      firstName: Joi.string().required(),
      lastName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).required(),
      role: Joi.string().valid(...Object.values(ROLES)).optional(),
      photo: Joi.string().allow('').optional(),
      phone: Joi.string().allow('').optional(),
      country: Joi.string().allow('').optional(),
      additionalInfo: Joi.string().allow('').optional(),
    }),
  },
  update: {
    body: Joi.object({
      firstName: Joi.string().optional(),
      lastName: Joi.string().optional(),
      email: Joi.string().email().optional(),
      password: Joi.string().min(8).optional(),
      role: Joi.string().valid(...Object.values(ROLES)).optional(),
      photo: Joi.string().allow('').optional(),
      phone: Joi.string().allow('').optional(),
      country: Joi.string().allow('').optional(),
      additionalInfo: Joi.string().allow('').optional(),
    }),
    params: Joi.object({
      id: Joi.string().regex(OBJECT_ID_REGEX).required(),
    }),
  },
  getById: {
    params: Joi.object({
      id: Joi.string().regex(OBJECT_ID_REGEX).required(),
    }),
  },
};
