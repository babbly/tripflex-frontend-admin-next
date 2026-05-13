// Tripflex 백엔드 공통 응답/도메인 타입.
// 출처: api.json (OpenAPI 3.1, "Tripflex Admin API" v1.0.0).
// 향후 openapi-typescript 등으로 자동 생성 교체 권장.

// ApiResponse: openapi 정의는 { success, data, message }.
// api.md엔 실패 시 code도 명시되어 있어 optional로 허용.
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
  code?: string;
};

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

// 메뉴별 권한 (api.json: MenuPermission)
export type MenuPermission = {
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
};

// api.json: LoginRequest
export type AdminLoginRequest = {
  loginId: string;
  password: string;
};

// api.json: LoginResponse — 로그인/리프레시 양쪽에서 동일 스키마 반환
export type AdminLoginResponse = {
  accessToken: string;
  refreshToken: string;
  adminId: string;
  loginId: string;
  name: string;
  role: 'SUPER' | 'OPERATOR' | string;
  mustChangePassword: boolean;
  // SUPER role 시 null. 그 외엔 메뉴명 → 권한 맵.
  permissions: Record<string, MenuPermission> | null;
};

// api.json: TokenRefreshRequest — refresh와 logout 양쪽이 동일 스키마
export type TokenRefreshRequest = {
  refreshToken: string;
};

// api.json: ChangePasswordRequest — newPassword 패턴: ^(?=.*[A-Za-z])(?=.*\d).{8,}$
export type AdminChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

// Spring Page 공통 응답 형태 (api.json: PageXxx)
export type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
  numberOfElements: number;
};
