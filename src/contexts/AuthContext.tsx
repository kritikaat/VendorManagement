import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '@/api/auth.api';
import type { AuthSession, LoginPayload, RegisterPayload, User } from '@/types/auth.types';

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistSession = useCallback((next: AuthSession) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  useEffect(() => {
    const stored = readStoredSession();
    if (!stored?.token) {
      setIsLoading(false);
      return;
    }

    setSession(stored);
    authApi
      .me()
      .then((user) => {
        persistSession({ user, token: stored.token });
      })
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
        setSession(null);
      })
      .finally(() => setIsLoading(false));
  }, [persistSession]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const { user, token } = await authApi.login(payload);
      persistSession({ user, token });
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const { user, token } = await authApi.signup(payload);
      persistSession({ user, token });
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
