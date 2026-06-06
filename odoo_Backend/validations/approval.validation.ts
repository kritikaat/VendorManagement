import { Joi } from 'express-validation';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

export const approvalValidation = {
  create: {
    body: Joi.object({
      rfqId: Joi.string().regex(OBJECT_ID_REGEX).required(),
      quotationId: Joi.string().regex(OBJECT_ID_REGEX).required(),
    }),
  },

  action: {
    body: Joi.object({
      remarks: Joi.string().optional().allow(''),
    }),
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },

  reject: {
    body: Joi.object({
      remarks: Joi.string().required().messages({
        'any.required': 'Remarks are required when rejecting',
      }),
    }),
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },

  getById: {
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },
};
