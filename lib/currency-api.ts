import { adminApi } from './admin-api';
import type {
  CurrencyCreateRequest,
  CurrencyListParams,
  CurrencyResponse,
  CurrencyUpdateRequest,
} from '@/types/currency';
import type { PageResponse } from '@/types/api';
import type { DisplayOrderUpdateRequest } from '@/types/country-currency-mapping';

function toQuery(params: CurrencyListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const currencyApi = {
  list: (params: CurrencyListParams = {}) =>
    adminApi.get<PageResponse<CurrencyResponse>>(
      `/api/admin/currencies${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<CurrencyResponse>(`/api/admin/currencies/${id}`),
  create: (body: CurrencyCreateRequest) =>
    adminApi.post<CurrencyResponse>('/api/admin/currencies', body),
  update: (id: string, body: CurrencyUpdateRequest) =>
    adminApi.patch<CurrencyResponse>(`/api/admin/currencies/${id}`, body),
  remove: (id: string) =>
    adminApi.delete<void>(`/api/admin/currencies/${id}`),
  updateSort: (body: DisplayOrderUpdateRequest) =>
    adminApi.patch<void>('/api/admin/currencies/sort', { items: body }),
};
