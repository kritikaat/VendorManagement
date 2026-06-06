import { Router } from 'express';
import { validate } from 'express-validation';
import { InvoiceController } from '../controllers/shared/invoice.controller.js';
import { invoiceValidation } from '../validations/invoice.validation.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get('/', InvoiceController.list);
router.post(
  '/',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(invoiceValidation.create),
  InvoiceController.create
);

router.get('/:id', validate(invoiceValidation.getById), InvoiceController.getById);
router.get('/:id/pdf', validate(invoiceValidation.getById), InvoiceController.downloadPDF);
router.post(
  '/:id/email',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(invoiceValidation.getById),
  InvoiceController.sendEmail
);
router.put(
  '/:id/paid',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(invoiceValidation.getById),
  InvoiceController.markPaid
);

export default router;
