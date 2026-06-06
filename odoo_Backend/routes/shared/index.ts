import { Router } from 'express';
import userSharedRoutes from './user.route.js';

const router: Router = Router();

router.use('/users', userSharedRoutes);

export default router;
