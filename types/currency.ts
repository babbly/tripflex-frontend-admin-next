// 통화 도메인 타입 — api.json: CurrencyResponse / CurrencyCreateRequest / CurrencyUpdateRequest
// 주의: API는 통화 → 국가 단일 매핑 (countryId 1개). UI에서 다중 매핑 표현 불가.

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

// 수정 시 currencyCode 변경 불가
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
