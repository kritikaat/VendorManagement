import { Router } from 'express';
import { validate } from 'express-validation';
import { RFQController } from '../controllers/shared/rfq.controller.js';
import { rfqValidation } from '../validations/rfq.validation.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';
import { upload } from '../middlewares/fileUpload.middleware.js';

const router: Router = Router();

router.get('/', RFQController.list);
router.post(
  '/',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(rfqValidation.create),
  RFQController.create
);

router.get('/:id', validate(rfqValidation.getById), RFQController.getById);
router.put(
  '/:id',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(rfqValidation.update),
  RFQController.update
);
router.delete(
  '/:id',
  AuthMiddleware.restrictTo(ROLES.ADMIN),
  validate(rfqValidation.getById),
  RFQController.remove
);

router.post(
  '/:id/vendors',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(rfqValidation.assignVendors),
  RFQController.assignVendors
);

router.post(
  '/:id/attachments',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  upload.single('file'),
  RFQController.uploadAttachment
);

router.put(
  '/:id/close',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(rfqValidation.getById),
  RFQController.close
);

export default router;
