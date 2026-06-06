import { IUser } from '../models/user/user.type.js';

/**
 * AuthDTO — shapes the data returned in a login response.
 * Only exposes fields the client needs; strips password and internal fields.
 */
export class AuthDTO {
  public token: string;
  public user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    photo?: string;
    phone?: string;
    country?: string;
    additionalInfo?: string;


  };

  constructor(user: IUser, token: string) {
    this.token = token;
    this.user = {
      id: user._id ? user._id.toString() : '',
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      photo: user.photo,
      phone: user.phone,
      country: user.country,
      additionalInfo: user.additionalInfo,

    };
  }
}
