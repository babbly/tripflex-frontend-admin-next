// Tripflex 백엔드(어드민 API) 전용 fetch 래퍼.
//
// - NEXT_PUBLIC_API_BASE_URL 기준으로 절대 URL 구성
// - Authorization: Bearer <accessToken> 자동 부착
// - ApiResponse<T> 언랩 → 성공 시 data 반환, 실패 시 ApiError throw
// - 401 응답 시 refresh 1회 시도 후 원 요청 재시도, 실패 시 토큰 폐기
// - 로그아웃은 body에 refreshToken 필수 (api.md 명시)
//
// 주의: 응답이 빈 본문(204 등)일 수 있으므로 JSON 파싱 실패는 정상 처리.

import {
  ApiError,
  ApiResponse,
  AdminLoginRequest,
  AdminLoginResponse,
} from '@/types/api';
import { authToken } from './auth-token';

type AdminFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  // 인증 필요 없는 호출(로그인 등) 시 true
  skipAuth?: boolean;
  // 내부 재시도 플래그 — 직접 사용 금지
  _isRetry?: boolean;
};

function getBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set. Check .env.local.',
    );
  }
  return base.replace(/\/$/, '');
}

function buildUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${getBaseUrl()}${normalized}`;
}

let refreshInflight: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInflight) return refreshInflight;

  const refreshToken = authToken.getRefresh();
  if (!refreshToken) return false;

  refreshInflight = (async () => {
    try {
      const res = await fetch(buildUrl('/api/admin/auth/refresh'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      // refresh는 login과 동일하게 전체 LoginResponse 반환 (api.json: ApiResponseLoginResponse)
      const json = (await res.json()) as ApiResponse<AdminLoginResponse>;
      if (!json.success || !json.data) return false;
      authToken.set(json.data.accessToken, json.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInflight = null;
    }
  })();

  return refreshInflight;
}

export async function adminFetch<T>(
  path: string,
  options: AdminFetchOptions = {},
): Promise<T> {
  const { body, skipAuth, _isRetry, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  if (body !== undefined && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }
  if (!skipAuth) {
    const access = authToken.getAccess();
    if (access) finalHeaders.set('Authorization', `Bearer ${access}`);
  }

  const res = await fetch(buildUrl(path), {
    ...rest,
    headers: finalHeaders,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  // 401 → refresh 1회 시도 후 재시도
  if (res.status === 401 && !skipAuth && !_isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return adminFetch<T>(path, { ...options, _isRetry: true });
    }
    authToken.clear();
    throw new ApiError('UNAUTHORIZED', 'Session expired.', 401);
  }

  // 빈 본문 응답 처리
  const text = await res.text();
  if (!text) {
    if (!res.ok) {
      throw new ApiError('HTTP_ERROR', res.statusText, res.status);
    }
    return undefined as T;
  }

  let json: ApiResponse<T>;
  try {
    json = JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new ApiError('INVALID_RESPONSE', text, res.status);
  }

  if (!json.success) {
    throw new ApiError(
      json.code ?? 'API_ERROR',
      json.message ?? res.statusText,
      res.status,
    );
  }
  return json.data;
}

// 자주 쓰는 메서드 단축
export const adminApi = {
  get: <T>(path: string, opts?: AdminFetchOptions) =>
    adminFetch<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: AdminFetchOptions) =>
    adminFetch<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: AdminFetchOptions) =>
    adminFetch<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, opts?: AdminFetchOptions) =>
    adminFetch<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, body?: unknown, opts?: AdminFetchOptions) =>
    adminFetch<T>(path, { ...opts, method: 'DELETE', body }),
};

// 인증 전용 헬퍼
export const adminAuthApi = {
  login: (payload: AdminLoginRequest) =>
    adminFetch<AdminLoginResponse>('/api/admin/auth/login', {
      method: 'POST',
      body: payload,
      skipAuth: true,
    }),

  // api.md: body에 refreshToken 필수. 헤더만 보내면 500.
  logout: async () => {
    const refreshToken = authToken.getRefresh();
    if (!refreshToken) return;
    try {
      await adminFetch<void>('/api/admin/auth/logout', {
        method: 'POST',
        body: { refreshToken },
      });
    } finally {
      authToken.clear();
    }
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    adminFetch<void>('/api/admin/auth/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    }),
};
