import { adminApi } from './admin-api';
import type {
  BannerCreateRequest,
  BannerListParams,
  BannerReorderItem,
  BannerResponse,
  BannerUpdateRequest,
  PageResponse,
} from '@/types/banner';

function toQuery(params: BannerListParams): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export const bannerApi = {
  list: (params: BannerListParams = {}) =>
    adminApi.get<PageResponse<BannerResponse>>(
      `/api/admin/banners${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<BannerResponse>(`/api/admin/banners/${id}`),
  create: (body: BannerCreateRequest) =>
    adminApi.post<BannerResponse>('/api/admin/banners', body),
  update: (id: string, body: BannerUpdateRequest) =>
    adminApi.patch<BannerResponse>(`/api/admin/banners/${id}`, body),
  remove: (id: string) =>
    adminApi.delete<void>(`/api/admin/banners/${id}`),
  reorder: (items: BannerReorderItem[]) =>
    adminApi.patch<void>('/api/admin/banners/reorder', items),
};
