import { useAdminAuth } from '@/providers/admin-auth-provider';

export type PagePermission = {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
};

// 백엔드 AuthService가 permissions 키로 menuName(한글)을 사용함 (getMenu().getMenuName())
// 백엔드 AuthService가 permissions 키로 menuName(한글)을 사용함 (getMenu().getMenuName())
const PATH_TO_MENU_NAME: Record<string, string> = {
  '/banner':         '홈 배너 관리',
  '/image-analysis': '이미지 분석 목록',
  '/suggestions':    '유저 제안 관리',
  '/faq':            'FAQ 관리',
  '/countries':      '국가/언어/통화',
  '/accounts':       '계정 관리',
  '/permissions':    '권한 그룹',
  '/activity-log':   '활동 로그',
};

export function usePagePermission(path: string): PagePermission {
  const { permissions } = useAdminAuth();

  if (permissions === null) {
    return { canRead: true, canWrite: true, canDelete: true };
  }

  const menuName = PATH_TO_MENU_NAME[path];
  const perm = menuName ? permissions[menuName] : undefined;

  if (!perm) {
    return { canRead: false, canWrite: false, canDelete: false };
  }

  return {
    canRead: perm.canRead ?? false,
    canWrite: perm.canWrite ?? false,
    canDelete: perm.canDelete ?? false,
  };
}
