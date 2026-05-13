// 어드민 계정 API 클라이언트 — /api/admin/admins

import { adminApi } from './admin-api';
import type {
  AdminAccountCreateRequest,
  AdminAccountListParams,
  AdminAccountResponse,
  AdminAccountUpdateRequest,
} from '@/types/admin-account';
import type { PageResponse } from '@/types/api';

function toQuery(params: AdminAccountListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const adminAccountApi = {
  list: (params: AdminAccountListParams = {}) =>
    adminApi.get<PageResponse<AdminAccountResponse>>(
      `/api/admin/admins${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<AdminAccountResponse>(`/api/admin/admins/${id}`),
  create: (body: AdminAccountCreateRequest) =>
    adminApi.post<AdminAccountResponse>('/api/admin/admins', body),
  update: (id: string, body: AdminAccountUpdateRequest) =>
    adminApi.patch<AdminAccountResponse>(`/api/admin/admins/${id}`, body),
  remove: (id: string) => adminApi.delete<void>(`/api/admin/admins/${id}`),
};
