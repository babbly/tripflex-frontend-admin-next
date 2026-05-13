export type ActivityLogResponse = {
  id: string;
  adminName: string;
  adminLoginId: string;
  menuCode: string;
  actionType: string;
  description?: string;
  ipAddress?: string;
  insDttm?: string;
};

export type ActivityLogListParams = {
  page?: number;
  size?: number;
  actionType?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
};

export type ActivityLogByAdminParams = {
  page?: number;
  size?: number;
};
