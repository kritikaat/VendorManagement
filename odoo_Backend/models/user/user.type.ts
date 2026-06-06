import { BaseDocument } from '../shared/schema.type.js';
import { UserRole } from '../../constants/json/types.js';

export interface IUser extends BaseDocument {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: UserRole;
  photo?: string;
  phone?: string;
  country?: string;
  additionalInfo?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  // Defined as an instance method in user.model.ts via userSchema.methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}
