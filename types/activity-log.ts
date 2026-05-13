// 활동 로그 도메인 타입 — api.json: ActivityLogResponse

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
  // yyyy-MM-dd
  startDate?: string;
  endDate?: string;
};

export type ActivityLogByAdminParams = {
  page?: number;
  size?: number;
};
