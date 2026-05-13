// 국가 API 클라이언트 — /api/admin/countries

import { adminApi } from './admin-api';
import type {
  CountryCreateRequest,
  CountryListParams,
  CountryResponse,
  CountryUpdateRequest,
  FlagUploadUrlRequest,
  FlagUploadUrlResponse,
} from '@/types/country';
import type { PageResponse } from '@/types/api';

function toQuery(params: CountryListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const countryApi = {
  list: (params: CountryListParams = {}) =>
    adminApi.get<PageResponse<CountryResponse>>(
      `/api/admin/countries${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<CountryResponse>(`/api/admin/countries/${id}`),
  create: (body: CountryCreateRequest) =>
    adminApi.post<CountryResponse>('/api/admin/countries', body),
  update: (id: string, body: CountryUpdateRequest) =>
    adminApi.patch<CountryResponse>(`/api/admin/countries/${id}`, body),
  remove: (id: string) =>
    adminApi.delete<void>(`/api/admin/countries/${id}`),
  // S3 키 수령 후에만 실제 동작. 인터페이스는 확정 (api.md: 외부 키 대기)
  flagUploadUrl: (body: FlagUploadUrlRequest) =>
    adminApi.post<FlagUploadUrlResponse>(
      '/api/admin/countries/flag-upload-url',
      body,
    ),
};
