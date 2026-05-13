// 언어 도메인 타입 — api.json: LanguageResponse / LanguageCreateRequest / LanguageUpdateRequest

export type LanguageResponse = {
  id: string;
  languageCode: string;
  nameKo: string;
  nameEn: string;
  nameNative?: string;
  rtl: boolean;
  displayOrder: number;
  active: boolean;
  insDttm?: string;
  updDttm?: string;
};

export type LanguageCreateRequest = {
  languageCode: string;
  nameKo: string;
  nameEn: string;
  nameNative?: string;
  rtl?: boolean;
  displayOrder?: number;
  active?: boolean;
};

// 수정 시 languageCode 변경 불가
export type LanguageUpdateRequest = {
  nameKo: string;
  nameEn: string;
  nameNative?: string;
  rtl?: boolean;
  displayOrder?: number;
  active?: boolean;
};

export type LanguageListParams = {
  page?: number;
  size?: number;
  activeOnly?: boolean;
};
