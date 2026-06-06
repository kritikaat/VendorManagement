import { IUser } from '../models/user/user.type.js';

export class UserDTO {
  public id: string;
  public firstName: string;
  public lastName: string;
  public email: string;
  public role: string;

  public photo?: string;
  public phone?: string;
  public country?: string;
  public additionalInfo?: string;
  public createdAt: string;

  constructor(user: IUser) {
    this.id = user._id ? user._id.toString() : '';
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.role = user.role;

    this.photo = user.photo;
    this.phone = user.phone;
    this.country = user.country;
    this.additionalInfo = user.additionalInfo;
    this.createdAt = user.createdAt ? user.createdAt.toISOString() : '';
  }

  /**
   * Helper to map an array of user docs
   */
  public static list(users: IUser[]): UserDTO[] {
    return users.map((user) => new UserDTO(user));
  }
}
