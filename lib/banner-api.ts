import { adminApi } from './admin-api';
import { authToken } from './auth-token';
import { ApiError, ApiResponse } from '@/types/api';
import type {
  BannerCreateRequest,
  BannerListParams,
  BannerReorderItem,
  BannerResponse,
  BannerUpdateRequest,
  PageResponse,
} from '@/types/banner';

export type BannerImageUploadResponse = {
  imageUrl: string;
  imagePath?: string;
};

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

  // 백엔드 업로드 엔드포인트 연동 — AWS 키 수령 후 활성화 (api.md P-9)
  uploadImage: async (file: File): Promise<BannerImageUploadResponse> => {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? '';
    const form = new FormData();
    form.append('file', file);

    const headers = new Headers();
    const access = authToken.getAccess();
    if (access) headers.set('Authorization', `Bearer ${access}`);

    const res = await fetch(`${base}/api/admin/banners/image-upload-url`, {
      method: 'POST',
      body: form,
      headers,
    });

    const text = await res.text();
    if (!text) {
      throw new ApiError('UPLOAD_FAILED', '이미지 업로드에 실패했습니다.', res.status);
    }
    let json: ApiResponse<BannerImageUploadResponse>;
    try {
      json = JSON.parse(text) as ApiResponse<BannerImageUploadResponse>;
    } catch {
      throw new ApiError('INVALID_RESPONSE', text, res.status);
    }
    if (!json.success || !json.data) {
      throw new ApiError(
        json.code ?? 'UPLOAD_FAILED',
        json.message ?? '이미지 업로드에 실패했습니다.',
        res.status,
      );
    }
    return json.data;
  },
};
