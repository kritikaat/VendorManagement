import { Joi } from 'express-validation';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const rfqValidation = {
  create: {
    body: Joi.object({
      title: Joi.string().required(),
      description: Joi.string().optional().allow(''),
      products: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            specification: Joi.string().optional().allow(''),
            quantity: Joi.number().integer().min(1).required(),
          })
        )
        .min(1)
        .required(),
      deadline: Joi.date().iso().min('now').required().messages({
        'date.min': 'Deadline cannot be a past date',
      }),
    }),
  },

  update: {
    body: Joi.object({
      title: Joi.string().optional(),
      description: Joi.string().optional().allow(''),
      products: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            specification: Joi.string().optional().allow(''),
            quantity: Joi.number().integer().min(1).required(),
          })
        )
        .optional(),
      deadline: Joi.date().iso().min('now').optional(),
    }),
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },

  assignVendors: {
    body: Joi.object({
      vendorIds: Joi.array().items(Joi.string().regex(OBJECT_ID_REGEX)).min(1).required(),
    }),
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },

  getById: {
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },
};
