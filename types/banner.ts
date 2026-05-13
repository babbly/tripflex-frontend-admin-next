export const BANNER_POSITIONS = ['TOP', 'BOTTOM', 'HOME'] as const;
export type BannerPosition = (typeof BANNER_POSITIONS)[number];

export const BANNER_POSITION_LABELS: Record<BannerPosition, string> = {
  TOP: '상단배너',
  BOTTOM: '하단배너',
  HOME: '홈 이미지',
};

export type BannerResponse = {
  id: string;
  title: string;
  subtitle?: string;
  tag?: string;
  imageUrl: string;
  imagePath?: string;
  linkUrl?: string;
  position: BannerPosition;
  displayOrder: number;
  startAt?: string;
  endAt?: string;
  active: boolean;
  insDttm?: string;
  updDttm?: string;
};

export type BannerCreateRequest = {
  title: string;
  imageUrl: string;
  subtitle?: string;
  tag?: string;
  imagePath?: string;
  linkUrl?: string;
  position?: BannerPosition;
  displayOrder?: number;
  startAt?: string;
  endAt?: string;
  active?: boolean;
};

export type BannerUpdateRequest = BannerCreateRequest;

export type BannerListParams = {
  page?: number;
  size?: number;
  position?: BannerPosition;
  activeOnly?: boolean;
  // expiredOnly와 activeOnly 동시 지정 시 expiredOnly 우선 (백엔드 동작)
  expiredOnly?: boolean;
  keyword?: string;
  startDate?: string;
  endDate?: string;
};

export type BannerReorderItem = {
  id: string;
  displayOrder: number;
};

export type { PageResponse } from './api';
