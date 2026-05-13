'use client';

// 어드민 인증 컨텍스트.
// - localStorage에 저장된 토큰 + sessionStorage의 user 정보를 hydrate
// - login: 백엔드 호출 → 토큰 저장 → 사용자 정보 컨텍스트 반영 → mustChangePassword 반환
// - logout: 백엔드 로그아웃 호출(body refreshToken 강제) → 컨텍스트 비움 → /login 이동
// - 라우트 가드 / 권한 체크용 user/permissions 노출

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
  // hydrate가 끝나야 라우트 가드가 안전하게 동작
  isReady: boolean;
  login: (
    loginId: string,
    password: string,
  ) => Promise<{ mustChangePassword: boolean }>;
  logout: () => Promise<void>;
  // 비밀번호 변경 후 mustChangePassword 플래그 갱신
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
      // 백엔드 응답 실패해도 클라 상태는 비움
      if (!(e instanceof ApiError)) {
        // ignore
      }
    } finally {
      authToken.clear();
      persistUser(null);
      setUser(null);
      router.replace('/login');
    }
  };

  // 비밀번호 변경 후 mustChangePassword 플래그 갱신
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
