'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminAuthApi } from '@/lib/admin-api';
import { authToken } from '@/lib/auth-token';
import {
  AdminLoginResponse,
  ApiError,
  MenuPermission,
} from '@/types/api';

const USER_KEY = 'tripflex.admin.user';

export type AdminUser = Omit<
  AdminLoginResponse,
  'accessToken' | 'refreshToken'
>;

type AdminAuthContextValue = {
  user: AdminUser | null;
  permissions: Record<string, MenuPermission> | null;
  isAuthenticated: boolean;
  isReady: boolean;
  login: (
    loginId: string,
    password: string,
  ) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  markPasswordChanged: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

function persistUser(user: AdminUser | null) {
  if (typeof window === 'undefined') return;
  if (user) {
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    window.sessionStorage.removeItem(USER_KEY);
  }
}

function loadUser(): AdminUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.sessionStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminUser;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const hasToken = !!authToken.getAccess();
    const stored = loadUser();
    if (hasToken && stored) setUser(stored);
    setIsReady(true);
  }, []);

  const login: AdminAuthContextValue['login'] = async (loginId, password) => {
    const res = await adminAuthApi.login({ loginId, password });
    authToken.set(res.accessToken, res.refreshToken);
    const { accessToken, refreshToken, ...rest } = res;
    void accessToken;
    void refreshToken;
    persistUser(rest);
    setUser(rest);
    return { mustChangePassword: res.mustChangePassword };
  };

  const logout: AdminAuthContextValue['logout'] = async () => {
    try {
      await adminAuthApi.logout();
    } catch (e) {
      if (!(e instanceof ApiError)) {
        /* swallow */
      }
    } finally {
      authToken.clear();
      persistUser(null);
      setUser(null);
      router.replace('/login');
    }
  };

  const markPasswordChanged = () => {
    if (!user) return;
    const next = { ...user, mustChangePassword: false };
    persistUser(next);
    setUser(next);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        permissions: user?.permissions ?? null,
        isAuthenticated: !!user,
        isReady,
        login,
        logout,
        markPasswordChanged,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
