import { UserModel } from './user.model.js';
import { IUser } from './user.type.js';
import { QueryOptions } from '../../types/common.type.js';

export class UserService {
  /**
   * Find a user by ID
   */
  public static async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).exec();
  }

  /**
   * Find a user by email.
   * Pass selectPassword=true to include the hashed password field (excluded by default).
   */
  public static async findByEmail(email: string, selectPassword = false): Promise<IUser | null> {
    const query = UserModel.findOne({ email });
    if (selectPassword) {
      query.select('+password');
    }
    return query.exec();
  }

  /**
   * Verify a plain-text password against the user's stored bcrypt hash.
   * Delegates to the comparePassword instance method on the Mongoose document.
   */
  public static async verifyPassword(user: IUser, candidatePassword: string): Promise<boolean> {
    return user.comparePassword(candidatePassword);
  }

  /**
   * Create a new user
   */
  public static async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new UserModel(userData);
    return user.save();
  }

  /**
   * List users with pagination and sorting options
   */
  public static async list(
    filter: Record<string, any>,
    options: QueryOptions
  ): Promise<{ docs: IUser[]; total: number }> {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const sort: Record<string, any> = {};
    if (options.sortBy) {
      sort[options.sortBy] = options.sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.createdAt = -1;
    }

    const [docs, total] = await Promise.all([
      UserModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      UserModel.countDocuments(filter).exec(),
    ]);

    return { docs, total };
  }

  /**
   * Update a user
   */
  public static async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  /**
   * Soft-delete a user
   */
  public static async softDelete(id: string): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).exec();
  }

  /**
   * Find a user by hashed password reset token, ensuring the token has not expired
   */
  public static async findByResetToken(hashedToken: string): Promise<IUser | null> {
    return UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
      isDeleted: false,
    }).exec();
  }
}
