import { Router } from 'express';
import { validate } from 'express-validation';
import { PurchaseOrderController } from '../controllers/shared/purchaseOrder.controller.js';
import { purchaseOrderValidation } from '../validations/purchaseOrder.validation.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get('/', PurchaseOrderController.list);
router.post(
  '/',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(purchaseOrderValidation.create),
  PurchaseOrderController.create
);

router.get('/:id', validate(purchaseOrderValidation.getById), PurchaseOrderController.getById);
router.get('/:id/pdf', validate(purchaseOrderValidation.getById), PurchaseOrderController.downloadPDF);
router.post(
  '/:id/email',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(purchaseOrderValidation.getById),
  PurchaseOrderController.sendEmail
);

export default router;
