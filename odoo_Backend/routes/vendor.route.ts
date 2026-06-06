import { Router } from 'express';
import { validate } from 'express-validation';
import { VendorController } from '../controllers/shared/vendor.controller.js';
import { vendorValidation } from '../validations/vendor.validation.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get('/search', VendorController.search);

router.get('/', VendorController.list);
router.post(
  '/',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(vendorValidation.create),
  VendorController.create
);

router.get('/:id', validate(vendorValidation.getById), VendorController.getById);
router.put(
  '/:id',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(vendorValidation.update),
  VendorController.update
);
router.delete(
  '/:id',
  AuthMiddleware.restrictTo(ROLES.ADMIN),
  validate(vendorValidation.getById),
  VendorController.remove
);

export default router;
