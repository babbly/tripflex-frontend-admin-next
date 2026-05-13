// FAQ API 클라이언트 — /api/admin/faqs

import { adminApi } from './admin-api';
import type {
  FaqCreateRequest,
  FaqListParams,
  FaqResponse,
  FaqUpdateRequest,
} from '@/types/faq';
import type { PageResponse } from '@/types/api';

function toQuery(params: FaqListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const faqApi = {
  list: (params: FaqListParams = {}) =>
    adminApi.get<PageResponse<FaqResponse>>(
      `/api/admin/faqs${toQuery(params)}`,
    ),
  detail: (id: string) => adminApi.get<FaqResponse>(`/api/admin/faqs/${id}`),
  create: (body: FaqCreateRequest) =>
    adminApi.post<FaqResponse>('/api/admin/faqs', body),
  update: (id: string, body: FaqUpdateRequest) =>
    adminApi.patch<FaqResponse>(`/api/admin/faqs/${id}`, body),
  remove: (id: string) => adminApi.delete<void>(`/api/admin/faqs/${id}`),
};
