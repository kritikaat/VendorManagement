import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from './user.type.js';
import { baseSchemaDefinition, softDeletePlugin } from '../shared/schema.js';
import { ROLES } from '../../constants/json/types.js';

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    photo: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    additionalInfo: {
      type: String,
      trim: true,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    ...baseSchemaDefinition,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving whenever it is set or changed
userSchema.pre('save', async function (next) {
  const doc = this as unknown as IUser;
  if (!this.isModified('password') || !doc.password) return next();
  doc.password = await bcrypt.hash(doc.password, 12);
  next();
});

// Instance method — compare a plain-text candidate against the stored hash
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  const doc = this as unknown as IUser;
  if (!doc.password) return false;
  return bcrypt.compare(candidatePassword, doc.password);
};

// Apply shared plugins
userSchema.plugin(softDeletePlugin);

export const UserModel = model<IUser>('User', userSchema);
export default UserModel;
