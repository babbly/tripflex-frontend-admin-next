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
