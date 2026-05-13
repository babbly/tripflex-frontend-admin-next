// 어드민 계정 도메인 타입 — api.json: AdminCreateRequest / AdminUpdateRequest / AdminResponse

export type AdminRole = 'SUPER' | 'OPERATOR';

export type AdminAccountResponse = {
  id: string;
  loginId: string;
  name: string;
  email?: string;
  role: AdminRole | string;
  authGroupId?: string;
  active: boolean;
  locked: boolean;
  lastLoginAt?: string;
  insDttm?: string;
  updDttm?: string;
  // 계정 생성 응답에만 포함됨. 본 프로젝트 정책상 백엔드가 '0000' 고정 발급 예정.
  temporaryPassword?: string;
};

export type AdminAccountCreateRequest = {
  loginId: string;
  name: string;
  email?: string;
  role?: AdminRole;
  authGroupId?: string;
};

// loginId 변경 불가 (api.json: AdminUpdateRequest)
export type AdminAccountUpdateRequest = {
  name: string;
  email?: string;
  role?: AdminRole;
  authGroupId?: string;
  active?: boolean;
};

export type AdminAccountListParams = {
  page?: number;
  size?: number;
  keyword?: string;
};
