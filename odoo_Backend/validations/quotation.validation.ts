import { Joi } from 'express-validation';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;

const pricingItem = Joi.object({
  productName: Joi.string().required(),
  unitPrice: Joi.number().min(0).required(),
  quantity: Joi.number().integer().min(1).required(),
  totalPrice: Joi.number().min(0).required(),
});

export const quotationValidation = {
  submit: {
    body: Joi.object({
      rfqId: Joi.string().regex(OBJECT_ID_REGEX).required(),
      pricing: Joi.array().items(pricingItem).min(1).required(),
      deliveryTimeline: Joi.number().integer().min(1).required(),
      notes: Joi.string().optional().allow(''),
    }),
  },

  update: {
    body: Joi.object({
      pricing: Joi.array().items(pricingItem).optional(),
      deliveryTimeline: Joi.number().integer().min(1).optional(),
      notes: Joi.string().optional().allow(''),
    }),
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },

  getById: {
    params: Joi.object({ id: Joi.string().regex(OBJECT_ID_REGEX).required() }),
  },
};
