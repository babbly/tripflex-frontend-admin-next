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
  temporaryPassword?: string;
};

export type AdminAccountCreateRequest = {
  loginId: string;
  name: string;
  email?: string;
  role?: AdminRole;
  authGroupId?: string;
};

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
