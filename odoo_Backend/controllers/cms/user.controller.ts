import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../models/user/user.service.js';
import { UserDTO } from '../../dto/user.dto.js';
import { ResponseFormatter } from '../../functions/sendRes.js';
import { HTTP_STATUS } from '../../constants/json/status.js';
import { AppError } from '../../utils/appError.js';
import { PaginationHelper } from '../../helpers/pagination.helper.js';

export class CMSUserController {
  /**
   * List users with pagination (Admin-only)
   */
  public static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;
      const options = {
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 10,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const { docs, total } = await UserService.list({}, options);
      const paginatedResult = PaginationHelper.mapResult(UserDTO.list(docs), total, options);

      ResponseFormatter.send(
        res,
        HTTP_STATUS.OK,
        'Users list fetched successfully',
        paginatedResult.docs,
        {
          totalDocs: paginatedResult.totalDocs,
          limit: paginatedResult.limit,
          totalPages: paginatedResult.totalPages,
          page: paginatedResult.page,
          hasPrevPage: paginatedResult.hasPrevPage,
          hasNextPage: paginatedResult.hasNextPage,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (Admin soft delete)
   */
  public static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const deletedUser = await UserService.softDelete(id);

      if (!deletedUser) {
        return next(new AppError('User not found', HTTP_STATUS.NOT_FOUND));
      }

      ResponseFormatter.send(res, HTTP_STATUS.OK, 'User deleted successfully', new UserDTO(deletedUser));
    } catch (error) {
      next(error);
    }
  }
}
export default CMSUserController;
