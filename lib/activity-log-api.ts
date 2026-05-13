// 활동 로그 API 클라이언트 — read-only.
// api.json: /api/admin/activity-logs, /api/admin/activity-logs/admin/{loginId}

import { adminApi } from './admin-api';
import type {
  ActivityLogByAdminParams,
  ActivityLogListParams,
  ActivityLogResponse,
} from '@/types/activity-log';
import type { PageResponse } from '@/types/api';

function toQuery(params: Record<string, unknown>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const activityLogApi = {
  list: (params: ActivityLogListParams = {}) =>
    adminApi.get<PageResponse<ActivityLogResponse>>(
      `/api/admin/activity-logs${toQuery(params)}`,
    ),
  byAdmin: (loginId: string, params: ActivityLogByAdminParams = {}) =>
    adminApi.get<PageResponse<ActivityLogResponse>>(
      `/api/admin/activity-logs/admin/${encodeURIComponent(loginId)}${toQuery(params)}`,
    ),
};
