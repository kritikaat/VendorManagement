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
    const body: Record<string, unknown> = {
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone,
      country: payload.country,
      role: payload.role,
      photo: payload.photo,
      additionalInfo: payload.additionalInfo,
    };
    if (payload.role === USER_ROLES.VENDOR && payload.vendorProfile) {
      body.vendorProfile = payload.vendorProfile;
    }

    const data = await unwrap<AuthPayload>(api.post(ENDPOINTS.auth.signup, body));
    return { user: mapUser(data.user), token: data.token };
  },

  me: async () => {
    const raw = await unwrap<ApiUser>(api.get(ENDPOINTS.auth.me));
    return mapUser(raw);
  },

  logout: () => unwrap(api.post(ENDPOINTS.auth.logout)),

  forgotPassword: (email: string) =>
    unwrap(api.post(ENDPOINTS.auth.forgotPassword, { email })),
};
