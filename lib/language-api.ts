import { adminApi } from './admin-api';
import type {
  LanguageCreateRequest,
  LanguageListParams,
  LanguageResponse,
  LanguageUpdateRequest,
} from '@/types/language';
import type { PageResponse } from '@/types/api';
import type { DisplayOrderUpdateRequest } from '@/types/country-currency-mapping';

function toQuery(params: LanguageListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const languageApi = {
  list: (params: LanguageListParams = {}) =>
    adminApi.get<PageResponse<LanguageResponse>>(
      `/api/admin/languages${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<LanguageResponse>(`/api/admin/languages/${id}`),
  create: (body: LanguageCreateRequest) =>
    adminApi.post<LanguageResponse>('/api/admin/languages', body),
  update: (id: string, body: LanguageUpdateRequest) =>
    adminApi.patch<LanguageResponse>(`/api/admin/languages/${id}`, body),
  remove: (id: string) =>
    adminApi.delete<void>(`/api/admin/languages/${id}`),
  updateSort: (body: DisplayOrderUpdateRequest) =>
    adminApi.patch<void>('/api/admin/languages/sort', { items: body }),
};
