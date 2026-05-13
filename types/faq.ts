// FAQ 도메인 타입 — api.json: FaqResponse / FaqCreateRequest / FaqUpdateRequest

export type FaqResponse = {
  id: string;
  category: string;
  question: string;
  answer: string;
  locale: string;
  displayOrder: number;
  active: boolean;
  insDttm?: string;
  updDttm?: string;
};

export type FaqCreateRequest = {
  category: string;
  question: string;
  answer: string;
  locale: string;
  displayOrder?: number;
  active?: boolean;
};

// 수정 시엔 locale 변경 불가 (api.json: FaqUpdateRequest)
export type FaqUpdateRequest = {
  category: string;
  question: string;
  answer: string;
  displayOrder?: number;
  active?: boolean;
};

export type FaqListParams = {
  page?: number;
  size?: number;
  locale?: string;
  category?: string;
  activeOnly?: boolean;
};

// FAQ locale 옵션 — 백엔드 enum이 아니라 자유 문자열이지만 자주 쓰는 값을 표준화
export const FAQ_LOCALES = ['ko', 'en'] as const;
export type FaqLocale = (typeof FAQ_LOCALES)[number];
export const FAQ_LOCALE_LABELS: Record<FaqLocale, string> = {
  ko: '한국어',
  en: '영어',
};
