import {
  ApiError,
  ApiResponse,
  AdminLoginRequest,
  AdminLoginResponse,
} from '@/types/api';
import { authToken } from './auth-token';

type AdminFetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  skipAuth?: boolean;
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

  if (res.status === 401 && !skipAuth && !_isRetry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return adminFetch<T>(path, { ...options, _isRetry: true });
    }
    authToken.clear();
    throw new ApiError('UNAUTHORIZED', 'Session expired.', 401);
  }

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
