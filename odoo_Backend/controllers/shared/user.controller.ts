import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../models/user/user.service.js';
import { UserDTO } from '../../dto/user.dto.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { HTTP_STATUS } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';

export class SharedUserController {
  /**
   * Fetch current authenticated user profile
   */
  public static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
      }

      const user = await UserService.findById(req.user.id);
      if (!user) {
        return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
      }

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Profile fetched successfully', new UserDTO(user));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current authenticated user profile
   */
  public static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        return next(new AppError('Unauthorized', HTTP_STATUS.UNAUTHORIZED));
      }

      const updatedUser = await UserService.update(req.user.id, req.body);
      if (!updatedUser) {
        return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
      }

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'Profile updated successfully', new UserDTO(updatedUser));
    } catch (error) {
      next(error);
    }
  }
}
export default SharedUserController;
