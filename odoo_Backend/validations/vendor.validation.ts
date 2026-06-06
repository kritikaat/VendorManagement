import { Joi } from 'express-validation';

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PHONE_REGEX = /^[0-9]{10}$/;
const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const vendorValidation = {
  create: {
    body: Joi.object({
      companyName: Joi.string().required(),
      category: Joi.string().required(),
      GSTNumber: Joi.string().regex(GST_REGEX).required().messages({
        'string.pattern.base': 'GSTNumber must be a valid 15-character Indian GST number',
      }),
      email: Joi.string().email().lowercase().required(),
      phone: Joi.string().regex(PHONE_REGEX).required().messages({
        'string.pattern.base': 'Phone must be a 10-digit number',
      }),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      rating: Joi.number().min(0).max(5).optional(),
      status: Joi.string().valid('Active', 'Inactive', 'Blacklisted').optional(),
    }),
  },

  update: {
    body: Joi.object({
      companyName: Joi.string().optional(),
      category: Joi.string().optional(),
      GSTNumber: Joi.string().regex(GST_REGEX).optional(),
      email: Joi.string().email().lowercase().optional(),
      phone: Joi.string().regex(PHONE_REGEX).optional(),
      address: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      rating: Joi.number().min(0).max(5).optional(),
      status: Joi.string().valid('Active', 'Inactive', 'Blacklisted').optional(),
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
