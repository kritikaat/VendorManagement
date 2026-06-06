import { Router } from 'express';
import { LogsController } from '../controllers/shared/logs.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get('/', AuthMiddleware.restrictTo(ROLES.ADMIN), LogsController.list);

export default router;
