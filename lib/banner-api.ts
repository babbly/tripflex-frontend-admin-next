import { adminApi } from './admin-api';
import { ApiError } from '@/types/api';
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

type BannerUploadUrlResponse = {
  uploadUrl: string;
  publicUrl: string;
  imagePath: string;
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

  uploadImage: async (file: File): Promise<BannerImageUploadResponse> => {
    const presignRes = await adminApi.post<BannerUploadUrlResponse>(
      '/api/admin/banners/banner-upload-url',
      { filename: file.name, contentType: file.type },
    );

    const putRes = await fetch(presignRes.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!putRes.ok) {
      throw new ApiError('UPLOAD_FAILED', '이미지 업로드에 실패했습니다.', putRes.status);
    }

    return { imageUrl: presignRes.publicUrl, imagePath: presignRes.imagePath };
  },
};
