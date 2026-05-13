import { adminApi } from './admin-api';
import { authToken } from './auth-token';
import type {
  CommentRequest,
  CommentResponse,
  ReviewRequest,
  SuggestionCategoryResponse,
  SuggestionDetail,
  SuggestionListParams,
  SuggestionSummary,
} from '@/types/suggestion';
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

export const suggestionApi = {
  list: (params: SuggestionListParams = {}) =>
    adminApi.get<PageResponse<SuggestionSummary>>(
      `/api/admin/suggestions${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<SuggestionDetail>(`/api/admin/suggestions/${id}`),
  review: (id: string, body: ReviewRequest) =>
    adminApi.patch<SuggestionDetail>(
      `/api/admin/suggestions/${id}/review`,
      body,
    ),
  addComment: (id: string, body: CommentRequest) =>
    adminApi.post<CommentResponse>(
      `/api/admin/suggestions/${id}/comments`,
      body,
    ),
  toggleCommentConfirm: (suggestionId: string, commentId: string) =>
    adminApi.patch<CommentResponse>(
      `/api/admin/suggestions/${suggestionId}/comments/${commentId}/confirm`,
    ),

  downloadJson: async (params: SuggestionListParams = {}) => {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/suggestions/download/json${toQuery(params)}`;
    const access = authToken.getAccess();
    const res = await fetch(url, {
      headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    });
    if (!res.ok) throw new Error('다운로드에 실패했습니다.');
    const blob = await res.blob();
    return blob;
  },
};

export const suggestionCategoryApi = {
  list: (params: { page?: number; size?: number; activeOnly?: boolean } = {}) =>
    adminApi.get<PageResponse<SuggestionCategoryResponse>>(
      `/api/admin/suggestion-categories${toQuery(params)}`,
    ),
  detail: (id: string) =>
    adminApi.get<SuggestionCategoryResponse>(
      `/api/admin/suggestion-categories/${id}`,
    ),
  create: (body: {
    code: string;
    shortName: string;
    fullName: string;
    description?: string;
    displayOrder?: number;
    active?: boolean;
  }) =>
    adminApi.post<SuggestionCategoryResponse>(
      '/api/admin/suggestion-categories',
      body,
    ),
  update: (
    id: string,
    body: {
      shortName: string;
      fullName: string;
      description?: string;
      displayOrder?: number;
      active?: boolean;
    },
  ) =>
    adminApi.patch<SuggestionCategoryResponse>(
      `/api/admin/suggestion-categories/${id}`,
      body,
    ),
  remove: (id: string) =>
    adminApi.delete<void>(`/api/admin/suggestion-categories/${id}`),
};
