import { Router } from 'express';
import { DashboardController } from '../controllers/shared/dashboard.controller.js';

const router: Router = Router();

router.get('/', DashboardController.get);

export default router;
