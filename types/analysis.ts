export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type LatencyType = 'VISION' | 'GEMINI' | 'TRANSLATE';

export interface AnalysisMenuItem {
  id: string;
  originalName: string;
  translatedName: string;
  originalPrice: string;
  parsedPrice: number;
  currency: string;
  description: string;
  boundingBox: string;
  orientation: string;
  displayOrder: number;
}

export interface AnalysisImage {
  id: string;
  imageUrl: string;
  recognized: boolean;
}

export interface AnalysisResponse {
  id: string;
  deviceId: string;
  imageUrl: string;
  sourceLanguage: string;
  targetLanguage: string;
  countryCode: string;
  countryName: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  ocrModel?: string;
  status: AnalysisStatus;
  menuItems: AnalysisMenuItem[];
  analysisImages?: AnalysisImage[];
  insDttm: string;
  imageUploadMs?: number;
  ocrMs?: number;
  aiMs?: number;
  translateMs?: number;
  totalMs?: number;
}

export interface AnalysisListParams {
  page?: number;
  size?: number;
  status?: AnalysisStatus;
  deviceId?: string;
  countryCode?: string;
  startDate?: string;
  endDate?: string;
  latencyType?: LatencyType;
  latencyMin?: number;
  latencyMax?: number;
}
