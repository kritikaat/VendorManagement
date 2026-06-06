import { Router } from 'express';
import userCmsRoutes from './user.route.js';

const router: Router = Router();

// Mount resources
router.use('/users', userCmsRoutes);

export default router;
