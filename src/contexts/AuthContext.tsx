import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/types/auth.types';
import { USER_ROLES } from '@/types/auth.types';
import { DEMO_PASSWORD, DEMO_USERS } from '@/data/demoUsers';

const STORAGE_KEY = 'vendorbridge_session';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession(): AuthSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function resolveDemoUser(email: string): User | null {
  const profile = DEMO_USERS[email.toLowerCase()];
  if (!profile) return null;

  return {
    id: `demo-${profile.role}`,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: email.toLowerCase(),
    role: profile.role,
  };
}

function createMockUser(payload: RegisterPayload | LoginPayload): User {
  if ('firstName' in payload) {
    return {
      id: 'mock-user-1',
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: payload.role ?? USER_ROLES.PROCUREMENT_OFFICER,
      phone: payload.phone,
      country: payload.country,
      additionalInfo: payload.additionalInfo,
    };
  }

  const demoUser = resolveDemoUser(payload.email);
  if (demoUser) return demoUser;

  return {
    id: 'mock-user-1',
    firstName: 'Procurement',
    lastName: 'Officer',
    email: payload.email,
    role: USER_ROLES.PROCUREMENT_OFFICER,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setSession(readStoredSession());
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((next: AuthSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      await new Promise((resolve) => setTimeout(resolve, 400));

      const demoUser = resolveDemoUser(payload.email);
      if (demoUser && payload.password !== DEMO_PASSWORD) {
        throw new Error('Invalid credentials');
      }

      const user = createMockUser(payload);
      persistSession({
        user,
        token: 'mock-jwt-token',
      });
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const user = createMockUser(payload);
      persistSession({
        user,
        token: 'mock-jwt-token',
      });
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      token: session?.token ?? null,
      isLoading,
      login,
      register,
      logout,
    }),
    [session, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
}
