export type CountryResponse = {
  id: string;
  countryCode: string;
  nameKo: string;
  nameEn: string;
  flagImageUrl?: string;
  flagImagePath?: string;
  defaultLanguageCode?: string;
  defaultCurrencyCode?: string;
  displayOrder: number;
  active: boolean;
  insDttm?: string;
  updDttm?: string;
};

export type CountryCreateRequest = {
  countryCode: string;
  nameKo: string;
  nameEn: string;
  flagImageUrl?: string;
  flagImagePath?: string;
  defaultLanguageCode?: string;
  defaultCurrencyCode?: string;
  displayOrder?: number;
  active?: boolean;
};

export type CountryUpdateRequest = {
  nameKo: string;
  nameEn: string;
  flagImageUrl?: string;
  flagImagePath?: string;
  defaultLanguageCode?: string;
  defaultCurrencyCode?: string;
  displayOrder?: number;
  active?: boolean;
};

export type CountryListParams = {
  page?: number;
  size?: number;
  activeOnly?: boolean;
};

export type FlagUploadUrlRequest = {
  filename: string;
  contentType: string;
};

export type FlagUploadUrlResponse = {
  uploadUrl: string;
  publicUrl: string;
  imagePath: string;
};
