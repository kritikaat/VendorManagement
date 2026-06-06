import { Router } from 'express';
import { validate } from 'express-validation';
import { QuotationController } from '../controllers/shared/quotation.controller.js';
import { quotationValidation } from '../validations/quotation.validation.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get(
  '/',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER),
  QuotationController.list
);
router.get('/vendor', AuthMiddleware.restrictTo(ROLES.VENDOR), QuotationController.getVendorQuotations);
router.get(
  '/rfq/:rfqId',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER),
  QuotationController.getRFQQuotations
);

router.post(
  '/',
  AuthMiddleware.restrictTo(ROLES.VENDOR),
  validate(quotationValidation.submit),
  QuotationController.submit
);

router.put(
  '/:id',
  AuthMiddleware.restrictTo(ROLES.VENDOR),
  validate(quotationValidation.update),
  QuotationController.update
);

router.put(
  '/:id/withdraw',
  AuthMiddleware.restrictTo(ROLES.VENDOR),
  validate(quotationValidation.getById),
  QuotationController.withdraw
);

export default router;
