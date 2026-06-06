import { Router } from 'express';
import { validate } from 'express-validation';
import { CMSUserController } from '../../controllers/cms/user.controller.js';
import { userValidation } from '../../validations/user.validation.js';

const router: Router = Router();

// GET /api/v1/cms/users - List users with pagination
router.get('/', CMSUserController.listUsers);

// DELETE /api/v1/cms/users/:id - Delete a user
router.delete('/:id', validate(userValidation.getById), CMSUserController.deleteUser);

export default router;
