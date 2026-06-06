import { Router } from 'express';
import { validate } from 'express-validation';
import { AuthController } from '../controllers/shared/auth.controller.js';
import { userValidation } from '../validations/user.validation.js';
import { AuthMiddleware } from '../middlewares/auth.middleware.js';

const router: Router = Router();

router.post('/signup', validate(userValidation.signup), AuthController.signup);
router.post('/login', validate(userValidation.login), AuthController.login);
router.post('/logout', AuthController.logout);
// ─── OTP-based forgot password flow ──────────────────────────────────────────
// Step 1: Request OTP → sent to email
router.post('/forgot-password', validate(userValidation.forgotPassword), AuthController.forgotPassword);
// Step 2: Submit OTP → receive a short-lived resetToken
router.post('/verify-otp', validate(userValidation.verifyOtp), AuthController.verifyOtp);
// Step 3: Submit resetToken + new password → password updated
router.post('/reset-password', validate(userValidation.resetPassword), AuthController.resetPassword);
router.post('/refresh-token', AuthController.refreshToken);
router.put('/change-password', AuthMiddleware.authenticate, validate(userValidation.changePassword), AuthController.changePassword);
router.get('/me', AuthMiddleware.authenticate, AuthController.me);

export default router;
