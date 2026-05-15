import { adminApi } from './admin-api';
import { authToken } from './auth-token';
import type { AnalysisListParams, AnalysisResponse } from '@/types/analysis';
import type { PageResponse } from '@/types/api';

function toQuery(params: Record<string, unknown>): string {
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

  downloadImagesZip: async (ids: string[]) => {
    const access = authToken.getAccess();
    const res = await fetch(`${base()}/api/admin/analyses/download/images-zip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) throw new Error('다운로드에 실패했습니다.');
    return res.blob();
  },
};
