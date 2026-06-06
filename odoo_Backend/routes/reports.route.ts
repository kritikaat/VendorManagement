import { Router } from 'express';
import { ReportsController } from '../controllers/shared/reports.controller.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

router.get('/vendor-performance', AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), ReportsController.vendorPerformance);
router.get('/procurement-summary', ReportsController.procurementSummary);
router.get('/monthly-trends', ReportsController.monthlyTrends);
router.get('/spend-analysis', AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.PROCUREMENT_OFFICER), ReportsController.spendAnalysis);
router.get('/export', ReportsController.exportReport);

export default router;
