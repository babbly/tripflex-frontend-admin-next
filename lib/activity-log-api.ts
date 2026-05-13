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
