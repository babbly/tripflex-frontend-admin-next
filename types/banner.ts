// 배너 도메인 타입 — api.json: BannerResponse / BannerCreateRequest / BannerUpdateRequest / BannerReorderItem
// position: TOP|BOTTOM|HOME — api.md 명세상 어드민 UI의 상단/중단/하단 ↔ TOP/HOME/BOTTOM 매핑

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
  // expiredOnly=true: active=false + endAt < now (NULL endAt 제외), endAt DESC 정렬.
  // activeOnly와 동시 지정 시 expiredOnly가 우선. (백엔드 커밋 44169af)
  expiredOnly?: boolean;
  keyword?: string;
  // yyyy-MM-dd
  startDate?: string;
  endDate?: string;
};

export type BannerReorderItem = {
  id: string;
  displayOrder: number;
};

export type { PageResponse } from './api';
