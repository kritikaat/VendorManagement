import { Router } from 'express';
import { validate } from 'express-validation';
import { ApprovalController } from '../controllers/shared/approval.controller.js';
import { approvalValidation } from '../validations/approval.validation.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get('/', ApprovalController.list);

router.post(
  '/',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER),
  validate(approvalValidation.create),
  ApprovalController.create
);

router.get('/:id/timeline', validate(approvalValidation.getById), ApprovalController.getTimeline);

router.put(
  '/:id/approve',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  validate(approvalValidation.action),
  ApprovalController.approve
);

router.put(
  '/:id/reject',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.MANAGER),
  validate(approvalValidation.reject),
  ApprovalController.reject
);

export default router;
