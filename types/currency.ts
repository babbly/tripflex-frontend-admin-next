export type CurrencyResponse = {
  id: string;
  currencyCode: string;
  nameKo: string;
  nameEn: string;
  symbol: string;
  decimalPlaces?: number;
  countryId?: string;
  displayOrder: number;
  active: boolean;
  insDttm?: string;
  updDttm?: string;
};

export type CurrencyCreateRequest = {
  currencyCode: string;
  nameKo: string;
  nameEn: string;
  symbol: string;
  decimalPlaces?: number;
  countryId?: string;
  displayOrder?: number;
  active?: boolean;
};

export type CurrencyUpdateRequest = {
  nameKo: string;
  nameEn: string;
  symbol: string;
  decimalPlaces?: number;
  countryId?: string;
  displayOrder?: number;
  active?: boolean;
};

export type CurrencyListParams = {
  page?: number;
  size?: number;
  activeOnly?: boolean;
};
