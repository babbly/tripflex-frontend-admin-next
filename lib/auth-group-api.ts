import { adminApi } from './admin-api';
import type {
  AdminMenuResponse,
  AuthGroupCreateRequest,
  AuthGroupListParams,
  AuthGroupResponse,
  AuthGroupUpdateRequest,
} from '@/types/auth-group';
import type { PageResponse } from '@/types/api';

function toQuery(params: AuthGroupListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const authGroupApi = {
  list: (params: AuthGroupListParams = {}) =>
    adminApi.get<PageResponse<AuthGroupResponse>>(
      `/api/admin/auth-groups${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<AuthGroupResponse>(`/api/admin/auth-groups/${id}`),
  create: (body: AuthGroupCreateRequest) =>
    adminApi.post<AuthGroupResponse>('/api/admin/auth-groups', body),
  update: (id: string, body: AuthGroupUpdateRequest) =>
    adminApi.patch<AuthGroupResponse>(`/api/admin/auth-groups/${id}`, body),
  remove: (id: string) =>
    adminApi.delete<void>(`/api/admin/auth-groups/${id}`),
  menus: () =>
    adminApi.get<AdminMenuResponse[]>('/api/admin/auth-groups/menus'),
};
