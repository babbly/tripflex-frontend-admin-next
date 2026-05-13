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
import type { DisplayOrderUpdateRequest } from '@/types/country-currency-mapping';

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
  flagUploadUrl: (body: FlagUploadUrlRequest) =>
    adminApi.post<FlagUploadUrlResponse>(
      '/api/admin/countries/flag-upload-url',
      body,
    ),
  updateSort: (body: DisplayOrderUpdateRequest) =>
    adminApi.patch<void>('/api/admin/countries/sort', { items: body }),
};
