// 권한 그룹 도메인 타입 — api.json: AuthGroupResponse / AuthGroupCreateRequest / AuthGroupUpdateRequest
// 주의: api.json엔 menuPermissions가 응답/요청 스키마에 없지만, 실제 백엔드는 GET /{id} 응답에 포함하고
// PATCH /{id} 요청 본문에도 menuPermissions 전체 교체 방식으로 받는다 (api.md 명시).

export type AuthGroupMenuPermission = {
  id?: string;
  menuId: string;
  menuCode?: string;
  menuName?: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
};

export type AuthGroupResponse = {
  id: string;
  groupCode: string;
  groupName: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  // 목록에선 null, 상세에선 전체 메뉴 권한 배열
  menuPermissions?: AuthGroupMenuPermission[] | null;
  insDttm?: string;
  updDttm?: string;
};

export type AuthGroupCreateRequest = {
  groupCode: string;
  groupName: string;
  description?: string;
  displayOrder?: number;
  active?: boolean;
};

// menuPermissions 전체 교체 방식 — 일부만 보내면 빠진 메뉴는 권한 박탈
export type AuthGroupUpdateRequest = {
  groupName: string;
  description?: string;
  displayOrder?: number;
  active?: boolean;
  menuPermissions?: Array<{
    menuId: string;
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
  }>;
};

export type AuthGroupListParams = {
  page?: number;
  size?: number;
  activeOnly?: boolean;
};

// 메뉴 카탈로그 응답 (api.json: AdminMenuResponse)
export type AdminMenuResponse = {
  id: string;
  menuCode: string;
  menuName: string;
  parentId?: string;
  path?: string;
  icon?: string;
  displayOrder: number;
  active: boolean;
};
