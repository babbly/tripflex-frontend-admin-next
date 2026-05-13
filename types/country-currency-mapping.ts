export type CountryCurrencyMappingResponse = {
  id: string;
  countryId: string;
  currencyId: string;
  insDttm?: string;
};

export type CountryCurrencyMappingCreateRequest = {
  countryId: string;
  currencyId: string;
};

export type CountryCurrencyMappingListParams = {
  countryId?: string;
  currencyId?: string;
};

export type DisplayOrderUpdateItem = {
  id: string;
  displayOrder: number;
};

export type DisplayOrderUpdateRequest = DisplayOrderUpdateItem[];
