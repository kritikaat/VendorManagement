import { Router } from 'express';
import { validate } from 'express-validation';
import { SharedUserController } from '../../controllers/shared/user.controller.js';
import { userValidation } from '../../validations/user.validation.js';

const router: Router = Router();

// GET /api/v1/shared/users/profile - Get profile of authenticated user
router.get('/profile', SharedUserController.getProfile);

// PUT /api/v1/shared/users/profile - Update profile details
router.put('/profile', validate(userValidation.update), SharedUserController.updateProfile);

export default router;
