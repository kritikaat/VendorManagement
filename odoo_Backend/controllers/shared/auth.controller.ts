import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserService } from '../../models/user/user.service.js';
import { VendorService } from '../../models/vendor/vendor.service.js';
import { AuthDTO } from '../../dto/auth.dto.js';
import { UserDTO } from '../../dto/user.dto.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { CookieFactory } from '../../functions/cookieFactory.js';
import { HTTP_STATUS, AUTH_MESSAGES } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { config } from '../../config/environment.js';
import { EmailHelper } from '../../helpers/email.helper.js';
import { EMAIL_TEMPLATES } from '../../config/emailTemplates.js';
import { ActivityLogService } from '../../models/activityLog/activityLog.service.js';
import { ROLES } from '../../constants/json/types.js';

export class AuthController {
  /**
   * POST /api/v1/auth/signup
   */
  public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, email, password, role, photo, phone, country, additionalInfo, vendorProfile } = req.body;

      const existing = await UserService.findByEmail(email);
      if (existing) {
        return next(new AppError('Email already in use.', HTTP_STATUS.CONFLICT));
      }

      const resolvedRole = role || ROLES.USER;
      
      // Check if vendor profile already exists for this email
      if (resolvedRole === ROLES.VENDOR) {
        const existingVendor = await VendorService.findByEmail(email);
        if (existingVendor) {
          return next(new AppError('A vendor profile already exists for this email.', HTTP_STATUS.CONFLICT));
        }
      }

      const user = await UserService.create({
        firstName,
        lastName,
        email,
        password,
        role: resolvedRole,
        photo,
        phone,
        country,
        additionalInfo,
      });

      // Create vendor profile if role is vendor
      if (resolvedRole === ROLES.VENDOR && vendorProfile) {
        const vendor = await VendorService.create({
          companyName: vendorProfile.companyName,
          category: vendorProfile.category,
          GSTNumber: vendorProfile.GSTNumber,
          email,
          phone,
          address: vendorProfile.address,
          city: vendorProfile.city,
          state: vendorProfile.state,
          country: country || 'India',
          status: 'Active',
        });

        await ActivityLogService.log({
          userId: user._id?.toString(),
          action: 'VENDOR_REGISTERED',
          entityType: 'Vendor',
          entityId: vendor._id?.toString(),
          description: `Vendor profile created during signup: ${vendor.companyName}`,
          req,
        });
      }

      const token = jwt.sign(
        { id: user._id?.toString(), email: user.email, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
      );

      CookieFactory.setCookie(res, { name: 'token', value: token, maxAgeInMs: 7 * 24 * 60 * 60 * 1000 });

      await ActivityLogService.log({
        userId: user._id?.toString(),
        action: 'USER_SIGNUP',
        entityType: 'User',
        entityId: user._id?.toString(),
        description: `New user registered: ${email}`,
        req,
      });

      ResponseFormatter.send(res, HTTP_STATUS.CREATED, AUTH_MESSAGES.SIGNUP_SUCCESS, new AuthDTO(user, token));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/login
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      const user = await UserService.findByEmail(email, true);
      if (!user) {
        return next(new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED));
      }

      const isPasswordValid = await UserService.verifyPassword(user, password);
      if (!isPasswordValid) {
        return next(new AppError(AUTH_MESSAGES.INVALID_CREDENTIALS, HTTP_STATUS.UNAUTHORIZED));
      }

      const token = jwt.sign(
        { id: user._id?.toString(), email: user.email, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
      );

      const refreshToken = jwt.sign(
        { id: user._id?.toString() },
        config.JWT_REFRESH_SECRET,
        { expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
      );

      CookieFactory.setCookie(res, { name: 'token', value: token, maxAgeInMs: 24 * 60 * 60 * 1000 });
      CookieFactory.setCookie(res, { name: 'refreshToken', value: refreshToken, maxAgeInMs: 7 * 24 * 60 * 60 * 1000 });

      await ActivityLogService.log({
        userId: user._id?.toString(),
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user._id?.toString(),
        description: `User logged in: ${email}`,
        req,
      });

      ResponseFormatter.send(res, HTTP_STATUS.OK, AUTH_MESSAGES.LOGIN_SUCCESS, new AuthDTO(user, token));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/logout
   */
  public static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.clearCookie('token');
      res.clearCookie('refreshToken');
      ResponseFormatter.send(res, HTTP_STATUS.OK, AUTH_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/auth/me
   */
  public static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await UserService.findById(req.user!.id);
      if (!user) {
        return next(new AppError('User not found.', HTTP_STATUS.NOT_FOUND));
      }
      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Profile fetched.', new UserDTO(user));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/forgot-password
   *
   * Generates a 6-digit OTP, stores its hash in the DB, and emails it to the user.
   * OTP expires in 10 minutes.
   */
  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await UserService.findByEmail(email);
      if (!user) {
        // Return same success message to avoid email enumeration
        ResponseFormatter.send(res, HTTP_STATUS.OK, AUTH_MESSAGES.OTP_SENT);
        return;
      }

      // Step 1 — Generate a 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // Step 2 — Hash OTP before storing (never store plain OTP in DB)
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

      // Step 3 — Persist hashed OTP + expiry (10 minutes) to DB
      await UserService.update(user._id!.toString(), {
        passwordResetToken: hashedOtp,
        passwordResetExpires: new Date(Date.now() + 10 * 60 * 1000),
      } as any);

      // Step 4 — Send OTP email using the OTP template
      const emailTemplate = EMAIL_TEMPLATES.OTP_EMAIL(otp, 10);
      await EmailHelper.sendMail({
        to: email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });

      ResponseFormatter.send(res, HTTP_STATUS.OK, AUTH_MESSAGES.OTP_SENT);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/verify-otp
   *
   * Verifies the 6-digit OTP entered by the user.
   * On success, returns a short-lived resetToken (JWT) to be used in reset-password.
   */
  public static async verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp } = req.body;

      // Step 1 — Hash the submitted OTP to compare against stored hash
      const hashedOtp = crypto.createHash('sha256').update(otp).digest('hex');

      // Step 2 — Find user by email first, then validate token + expiry
      const user = await UserService.findByEmail(email);
      if (!user) {
        return next(new AppError(AUTH_MESSAGES.OTP_INVALID, HTTP_STATUS.BAD_REQUEST));
      }

      // Step 3 — Check OTP hash matches
      if (user.passwordResetToken !== hashedOtp) {
        return next(new AppError(AUTH_MESSAGES.OTP_INVALID, HTTP_STATUS.BAD_REQUEST));
      }

      // Step 4 — Check OTP has not expired
      if (!user.passwordResetExpires || user.passwordResetExpires < new Date()) {
        return next(new AppError(AUTH_MESSAGES.OTP_EXPIRED, HTTP_STATUS.BAD_REQUEST));
      }

      // Step 5 — OTP valid: issue a short-lived reset JWT (15 min)
      const resetToken = jwt.sign(
        { id: user._id?.toString(), purpose: 'password_reset' },
        config.JWT_SECRET,
        { expiresIn: '15m' }
      );

      // Step 6 — Clear OTP fields from DB so it can't be reused
      await UserService.update(user._id!.toString(), {
        passwordResetToken: undefined,
        passwordResetExpires: undefined,
      } as any);

      ResponseFormatter.send(res, HTTP_STATUS.OK, AUTH_MESSAGES.OTP_VERIFIED, { resetToken });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/reset-password
   *
   * Accepts the resetToken (issued after OTP verification) and the new password.
   */
  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { resetToken, password } = req.body;

      // Step 1 — Verify the reset JWT issued after OTP verification
      let decoded: { id: string; purpose: string };
      try {
        decoded = jwt.verify(resetToken, config.JWT_SECRET) as { id: string; purpose: string };
      } catch {
        return next(new AppError('Reset token is invalid or expired.', HTTP_STATUS.BAD_REQUEST));
      }

      // Step 2 — Ensure it is specifically a password_reset token
      if (decoded.purpose !== 'password_reset') {
        return next(new AppError('Invalid reset token.', HTTP_STATUS.BAD_REQUEST));
      }

      // Step 3 — Find the user and update password (pre-save hook will bcrypt it)
      const { UserModel } = await import('../../models/user/user.model.js');
      const user = await UserModel.findOne({ _id: decoded.id, isDeleted: false }).exec();
      if (!user) {
        return next(new AppError('User not found.', HTTP_STATUS.NOT_FOUND));
      }

      user.password = password;
      await user.save();

      ResponseFormatter.send(res, HTTP_STATUS.OK, AUTH_MESSAGES.PASSWORD_RESET_SUCCESS);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/v1/auth/change-password
   */
  public static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await UserService.findByEmail(req.user!.email, true);
      if (!user) {
        return next(new AppError('User not found.', HTTP_STATUS.NOT_FOUND));
      }

      const isValid = await UserService.verifyPassword(user, currentPassword);
      if (!isValid) {
        return next(new AppError('Current password is incorrect.', HTTP_STATUS.BAD_REQUEST));
      }

      user.password = newPassword;
      await user.save();

      ResponseFormatter.send(res, HTTP_STATUS.OK, AUTH_MESSAGES.PASSWORD_CHANGED);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/auth/refresh-token
   */
  public static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!refreshToken) {
        return next(new AppError('Refresh token missing.', HTTP_STATUS.UNAUTHORIZED));
      }

      const decoded = jwt.verify(refreshToken, config.JWT_REFRESH_SECRET) as { id: string };
      const user = await UserService.findById(decoded.id);
      if (!user) {
        return next(new AppError('User not found.', HTTP_STATUS.UNAUTHORIZED));
      }

      const token = jwt.sign(
        { id: user._id?.toString(), email: user.email, role: user.role },
        config.JWT_SECRET,
        { expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] }
      );

      CookieFactory.setCookie(res, { name: 'token', value: token, maxAgeInMs: 24 * 60 * 60 * 1000 });
      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Token refreshed.', { token });
    } catch (error) {
      next(new AppError(AUTH_MESSAGES.TOKEN_INVALID, HTTP_STATUS.UNAUTHORIZED));
    }
  }
}

export default AuthController;
