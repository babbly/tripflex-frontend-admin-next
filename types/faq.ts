export type FaqResponse = {
  id: string;
  question: string;
  answer: string;
  displayOrder: number;
  active: boolean;
  insDttm?: string;
  updDttm?: string;
};

export type FaqCreateRequest = {
  question: string;
  answer: string;
  displayOrder?: number;
  active?: boolean;
};

export type FaqUpdateRequest = {
  question: string;
  answer: string;
  displayOrder?: number;
  active?: boolean;
};

export type FaqListParams = {
  page?: number;
  size?: number;
  activeOnly?: boolean;
};
