import { adminApi } from './admin-api';
import { authToken } from './auth-token';
import type { AnalysisListParams, AnalysisResponse } from '@/types/analysis';
import type { PageResponse } from '@/types/api';

function toQuery(params: object): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    q.set(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

async function downloadBlob(url: string): Promise<Blob> {
  const access = authToken.getAccess();
  const res = await fetch(url, {
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
  });
  if (!res.ok) throw new Error('다운로드에 실패했습니다.');
  return res.blob();
}

const base = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export const analysisApi = {
  list: (params: AnalysisListParams = {}) =>
    adminApi.get<PageResponse<AnalysisResponse>>(
      `/api/admin/analyses${toQuery(params)}`,
    ),

  detail: (id: string) =>
    adminApi.get<AnalysisResponse>(`/api/admin/analyses/${id}`),

  downloadJson: (id: string) =>
    downloadBlob(`${base()}/api/admin/analyses/${id}/download/json`),

  downloadZip: (id: string) =>
    downloadBlob(`${base()}/api/admin/analyses/${id}/download/zip`),

  downloadImagesZip: async (params: AnalysisListParams = {}) => {
    const access = authToken.getAccess();
    const res = await fetch(
      `${base()}/api/admin/analyses/download/images-zip${toQuery(params)}`,
      { headers: access ? { Authorization: `Bearer ${access}` } : undefined },
    );
    if (!res.ok) throw new Error('다운로드에 실패했습니다.');
    const truncated = res.headers.get('X-Truncated') === 'true';
    const blob = await res.blob();
    return { blob, truncated };
  },

  downloadAllJson: async (params: AnalysisListParams = {}) => {
    const access = authToken.getAccess();
    const res = await fetch(
      `${base()}/api/admin/analyses/download/json${toQuery(params)}`,
      { headers: access ? { Authorization: `Bearer ${access}` } : undefined },
    );
    if (!res.ok) throw new Error('다운로드에 실패했습니다.');
    const truncated = res.headers.get('X-Truncated') === 'true';
    const totalCount = res.headers.get('X-Total-Count');
    const blob = await res.blob();
    return { blob, truncated, totalCount: totalCount ? Number(totalCount) : undefined };
  },
};
