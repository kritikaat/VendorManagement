import { api, unwrap } from '@/api/axios';
import { ENDPOINTS } from '@/api/endpoints';
import { normalizeRole } from '@/lib/normalizeRole';
import { resolveId } from '@/api/mappers';
import type { LoginPayload, RegisterPayload, User } from '@/types/auth.types';
import { USER_ROLES } from '@/types/auth.types';

interface ApiUser {
  id?: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  country?: string;
  photo?: string;
  additionalInfo?: string;
}

interface AuthPayload {
  user: ApiUser;
  token: string;
}

function mapUser(raw: ApiUser): User {
  return {
    id: resolveId(raw),
    firstName: raw.firstName,
    lastName: raw.lastName,
    email: raw.email,
    role: normalizeRole(raw.role),
    phone: raw.phone,
    country: raw.country,
    photo: raw.photo,
    additionalInfo: raw.additionalInfo,
  };
}

export const authApi = {
  login: async (payload: LoginPayload) => {
    const data = await unwrap<AuthPayload>(api.post(ENDPOINTS.auth.login, payload));
    return { user: mapUser(data.user), token: data.token };
  },

  signup: async (payload: RegisterPayload) => {
    console.log('Auth API - signup called with payload:', {
      ...payload,
      password: '[REDACTED]',
    });
    
    const body: Record<string, unknown> = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      role: payload.role,
    };

    // Only add optional fields if they exist
    if (payload.phone) body.phone = payload.phone;
    if (payload.country) body.country = payload.country;
    if (payload.photo) body.photo = payload.photo;
    if (payload.additionalInfo) body.additionalInfo = payload.additionalInfo;
    
    // Only add vendorProfile if role is VENDOR and vendorProfile exists
    if (payload.role === USER_ROLES.VENDOR && payload.vendorProfile) {
      body.vendorProfile = payload.vendorProfile;
    }

    console.log('Auth API - sending body to backend:', {
      ...body,
      password: '[REDACTED]',
    });

    try {
      const data = await unwrap<AuthPayload>(api.post(ENDPOINTS.auth.signup, body));
      console.log('Auth API - signup successful, received data');
      return { user: mapUser(data.user), token: data.token };
    } catch (error) {
      console.error('Auth API - signup failed:', error);
      throw error;
    }
  },

  me: async () => {
    const raw = await unwrap<ApiUser>(api.get(ENDPOINTS.auth.me));
    return mapUser(raw);
  },

  logout: () => unwrap(api.post(ENDPOINTS.auth.logout)),

  forgotPassword: (email: string) =>
    unwrap(api.post(ENDPOINTS.auth.forgotPassword, { email })),
};
