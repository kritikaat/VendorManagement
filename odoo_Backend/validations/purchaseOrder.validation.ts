import { Joi } from 'express-validation';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const purchaseOrderValidation = {
  create: {
    body: Joi.object({
      quotationId: Joi.string().regex(OBJECT_ID_REGEX).required(),
      taxRate: Joi.number().min(0).max(100).optional(),
    }),
  },

  getById: {
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },
};
