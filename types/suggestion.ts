export const SUGGESTION_STATUSES = ['PENDING', 'REVIEWED'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export const SUGGESTION_STATUS_LABELS: Record<SuggestionStatus, string> = {
  PENDING: '미처리',
  REVIEWED: '처리됨',
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
  deviceId?: string;
  categoryCode?: string;
  categoryName?: string;
  imageUrls?: string[];
  analysisImageUrl?: string;
};

export type CommentRequest = {
  content: string;
};

export type ReviewRequest = {
  status: 'REVIEWED';
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
