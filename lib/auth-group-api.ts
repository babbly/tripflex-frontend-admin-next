// 권한 그룹 API 클라이언트 — /api/admin/auth-groups
// Deprecated 2건 (.../menus 조회, .../menus/{menuId} PUT) 제외하고 신규 API만 사용.

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
  // 전체 메뉴 카탈로그 (path 없는 카테고리 제외, 12개 반환)
  menus: () =>
    adminApi.get<AdminMenuResponse[]>('/api/admin/auth-groups/menus'),
};
