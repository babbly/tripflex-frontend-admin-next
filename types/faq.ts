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

export const FAQ_LOCALES = ['ko', 'en'] as const;
export type FaqLocale = (typeof FAQ_LOCALES)[number];
export const FAQ_LOCALE_LABELS: Record<FaqLocale, string> = {
  ko: '한국어',
  en: '영어',
};
