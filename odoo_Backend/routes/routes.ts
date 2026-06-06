import { Router } from 'express';
import authRoutes from './auth.route.js';
import vendorRoutes from './vendor.route.js';
import rfqRoutes from './rfq.route.js';
import quotationRoutes from './quotation.route.js';
import comparisonRoutes from './comparison.route.js';
import approvalRoutes from './approval.route.js';
import purchaseOrderRoutes from './purchaseOrder.route.js';
import invoiceRoutes from './invoice.route.js';
import notificationRoutes from './notification.route.js';
import logsRoutes from './logs.route.js';
import reportsRoutes from './reports.route.js';
import dashboardRoutes from './dashboard.route.js';
import sharedRoutes from './shared/index.js';
import cmsRoutes from './cms/index.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';
import { ROLES } from '../constants/json/types.js';

const router: Router = Router();

// ─── Health check ─────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ─── Public auth routes ───────────────────────────────────────────────────────
router.use('/auth', authRoutes);

// ─── All procurement routes require authentication ────────────────────────────
router.use(AuthMiddleware.authenticate);

router.use('/dashboard', dashboardRoutes);
router.use('/vendors', vendorRoutes);
router.use('/rfqs', rfqRoutes);
router.use('/quotations', quotationRoutes);
router.use('/comparisons', comparisonRoutes);
router.use('/approvals', approvalRoutes);
router.use('/purchase-orders', purchaseOrderRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/notifications', notificationRoutes);
router.use('/logs', logsRoutes);
router.use('/reports', reportsRoutes);

// ─── Legacy routes (kept for backward compat) ─────────────────────────────────
router.use('/shared', sharedRoutes);
router.use('/cms', AuthMiddleware.restrictTo(ROLES.ADMIN, ROLES.SUPER_ADMIN), cmsRoutes);

export default router;
