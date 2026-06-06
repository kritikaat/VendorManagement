import { Router } from 'express';
import { ComparisonController } from '../controllers/shared/comparison.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get(
  '/:rfqId',
  AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER, ROLES.MANAGER),
  ComparisonController.compare
);

export default router;
