import { Router } from 'express';
import { NotificationController } from '../controllers/shared/notification.controller.js';

const router: Router = Router();

router.get('/', NotificationController.list);
router.put('/read-all', NotificationController.markAllRead);
router.put('/:id/read', NotificationController.markRead);

export default router;
