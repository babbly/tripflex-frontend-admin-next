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
