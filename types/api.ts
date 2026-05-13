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

export type MenuPermission = {
  canRead?: boolean;
  canWrite?: boolean;
  canDelete?: boolean;
};

export type AdminLoginRequest = {
  loginId: string;
  password: string;
};

export type AdminLoginResponse = {
  accessToken: string;
  refreshToken: string;
  adminId: string;
  loginId: string;
  name: string;
  role: 'SUPER' | 'OPERATOR' | string;
  mustChangePassword: boolean;
  // SUPER role 시 null
  permissions: Record<string, MenuPermission> | null;
};

export type TokenRefreshRequest = {
  refreshToken: string;
};

export type AdminChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

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
