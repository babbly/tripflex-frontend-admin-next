import { adminApi } from './admin-api';
import type {
  CountryCurrencyMappingCreateRequest,
  CountryCurrencyMappingListParams,
  CountryCurrencyMappingResponse,
} from '@/types/country-currency-mapping';

function toQuery(params: CountryCurrencyMappingListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const countryCurrencyMappingApi = {
  list: (params: CountryCurrencyMappingListParams = {}) =>
    adminApi.get<CountryCurrencyMappingResponse[]>(
      `/api/admin/country-currency-mappings${toQuery(params)}`,
    ),
  create: (body: CountryCurrencyMappingCreateRequest) =>
    adminApi.post<CountryCurrencyMappingResponse>(
      '/api/admin/country-currency-mappings',
      body,
    ),
  remove: (id: string) =>
    adminApi.delete<void>(`/api/admin/country-currency-mappings/${id}`),
};
