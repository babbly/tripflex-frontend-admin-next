// 제안 도메인 타입 — api.json: SuggestionSummary / SuggestionDetail / CommentRequest /
// CommentResponse / ReviewRequest / SuggestionCategory*

export const SUGGESTION_STATUSES = ['PENDING', 'REVIEWED', 'CLOSED'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  PENDING: '미처리',
  REVIEWED: '처리됨',
  CLOSED: '종료',
};

export type SuggestionSummary = {
  id: string;
  categoryId: string;
  content: string;
  status: SuggestionStatus | string;
  contactEmail?: string;
  deviceId?: string;
  imageUrl?: string;
  insDttm?: string;
  // api.md엔 categoryCode/Name 언급. openapi엔 없지만 백엔드가 보낼 수 있음.
  categoryCode?: string;
  categoryName?: string;
};

export type CommentResponse = {
  id: string;
  authorId?: string;
  authorName?: string;
  content: string;
  confirmed: boolean;
  insDttm?: string;
};

export type SuggestionDetail = {
  id: string;
  categoryId: string;
  analysisId?: string;
  menuItemId?: string;
  content: string;
  status: SuggestionStatus | string;
  adminNote?: string;
  contactEmail?: string;
  reviewedById?: string;
  reviewedAt?: string;
  insDttm?: string;
  comments?: CommentResponse[];
  // 편의 필드 (백엔드가 보낼 가능성 있음, 없으면 undefined로 안전)
  deviceId?: string;
  categoryCode?: string;
  categoryName?: string;
  imageUrls?: string[];
};

export type CommentRequest = {
  content: string;
};

export type ReviewRequest = {
  status: 'REVIEWED' | 'CLOSED';
  adminNote?: string;
};

export type SuggestionListParams = {
  page?: number;
  size?: number;
  status?: SuggestionStatus;
  content?: string;
  deviceId?: string;
  categoryCode?: string;
  startDate?: string;
  endDate?: string;
};

// 카테고리
export type SuggestionCategoryResponse = {
  id: string;
  code: string;
  shortName: string;
  fullName: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  insDttm?: string;
  updDttm?: string;
};
