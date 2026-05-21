'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  HelpCircle,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Users,
} from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  AdminTableHead,
  AdminTableHeaderRow,
} from '@/components/ui/admin-table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { authGroupApi } from '@/lib/auth-group-api';
import {
  AdminMenuResponse,
  AuthGroupMenuPermission,
  AuthGroupResponse,
} from '@/types/auth-group';
import { ApiError } from '@/types/api';
import { usePagePermission } from '@/hooks/use-page-permission';

const CustomHistoryIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className={className}>
    <g clipPath="url(#clip0_perm_history)">
      <path fillRule="evenodd" clipRule="evenodd" d="M8 0C10.0645 1.41295e-08 11.9638 0.252288 13.3722 0.6786C14.0725 0.890632 14.6924 1.15763 15.1515 1.48621C15.6024 1.80896 16 2.26926 16 2.86233V13.1377C15.9997 13.7289 15.6064 14.1889 15.1562 14.5129C14.6987 14.8422 14.0808 15.1094 13.3816 15.3214C11.9756 15.7477 10.0759 16 8 16C5.92405 16 4.0244 15.7477 2.61837 15.3214C1.91918 15.1094 1.30133 14.8422 0.84375 14.5129C0.421717 14.2092 0.0497713 13.7858 0.00473485 13.2469L0 13.1377V2.86233C0 2.26926 0.397638 1.80896 0.848485 1.48621C1.30757 1.15763 1.92751 0.890632 2.62784 0.6786C4.03621 0.252288 5.93549 0 8 0ZM14.5455 9.7352C14.1989 9.90584 13.8055 10.0556 13.3816 10.1842C11.9756 10.6104 10.0759 10.8619 8 10.8619C5.9241 10.8619 4.02439 10.6104 2.61837 10.1842C2.19449 10.0556 1.80107 9.90584 1.45455 9.7352V13.1377L1.46023 13.1695C1.47651 13.2202 1.53605 13.3254 1.74716 13.4774C2.02185 13.6751 2.46499 13.8822 3.0786 14.0683C4.29881 14.4382 6.03568 14.6789 8 14.6789C9.96432 14.6789 11.7012 14.4382 12.9214 14.0683C13.535 13.8822 13.9781 13.6751 14.2528 13.4774C14.5318 13.2766 14.5452 13.1572 14.5455 13.1377V9.7352ZM14.5455 4.59453C14.1964 4.76626 13.7994 4.91673 13.3722 5.04607C11.9638 5.47236 10.0645 5.72467 8 5.72467C5.93554 5.72467 4.0362 5.47236 2.62784 5.04607C2.20064 4.91673 1.80363 4.76626 1.45455 4.59453V7.99957C1.45455 8.01723 1.46517 8.13721 1.74716 8.34016C2.02188 8.53784 2.4649 8.74494 3.0786 8.93103C4.29882 9.30102 6.03563 9.54083 8 9.54083C9.96437 9.54083 11.7012 9.30102 12.9214 8.93103C13.5351 8.74494 13.9781 8.53784 14.2528 8.34016C14.5348 8.13721 14.5455 8.01723 14.5455 7.99957V4.59453ZM8 1.32108C6.04811 1.32108 4.31092 1.56123 3.08712 1.93173C2.47154 2.11812 2.02595 2.32613 1.74905 2.52432C1.46414 2.72832 1.45455 2.84747 1.45455 2.86233C1.45467 2.87837 1.46572 2.99752 1.74905 3.20034C2.02598 3.39852 2.4716 3.60658 3.08712 3.79294C4.31091 4.16342 6.04816 4.40359 8 4.40359C9.95184 4.40359 11.6891 4.16342 12.9129 3.79294C13.5284 3.60658 13.974 3.39852 14.2509 3.20034C14.5343 2.99752 14.5453 2.87837 14.5455 2.86233C14.5455 2.84747 14.5359 2.72832 14.2509 2.52432C13.974 2.32613 13.5285 2.11812 12.9129 1.93173C11.6891 1.56123 9.95189 1.32108 8 1.32108Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_perm_history">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const CustomShieldIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" className={className}>
    <g clipPath="url(#clip0_perm_shield)">
      <path d="M16 12.2891V16H12V14H10V12H8V10.3828C7.61458 10.5859 7.21094 10.7396 6.78906 10.8438C6.36719 10.9479 5.9375 11 5.5 11C4.99479 11 4.50781 10.9349 4.03906 10.8047C3.57031 10.6745 3.13281 10.4896 2.72656 10.25C2.32031 10.0104 1.95052 9.72396 1.61719 9.39062C1.28385 9.05729 0.994792 8.6849 0.75 8.27344C0.505208 7.86198 0.320312 7.42448 0.195312 6.96094C0.0703125 6.4974 0.00520833 6.01042 0 5.5C0 4.99479 0.0651042 4.50781 0.195312 4.03906C0.325521 3.57031 0.510417 3.13281 0.75 2.72656C0.989583 2.32031 1.27604 1.95052 1.60938 1.61719C1.94271 1.28385 2.3151 0.994792 2.72656 0.75C3.13802 0.505208 3.57552 0.320312 4.03906 0.195312C4.5026 0.0703125 4.98958 0.00520833 5.5 0C6.00521 0 6.49219 0.0651042 6.96094 0.195312C7.42969 0.325521 7.86719 0.510417 8.27344 0.75C8.67969 0.989583 9.04948 1.27604 9.38281 1.60938C9.71615 1.94271 10.0052 2.3151 10.25 2.72656C10.4948 3.13802 10.6797 3.57552 10.8047 4.03906C10.9297 4.5026 10.9948 4.98958 11 5.5C11 5.76562 10.9792 6.02865 10.9375 6.28906C10.8958 6.54948 10.8359 6.80469 10.7578 7.05469L16 12.2891ZM15 12.7109L9.60938 7.32031C9.72396 7.02344 9.81771 6.72656 9.89062 6.42969C9.96354 6.13281 10 5.82292 10 5.5C10 4.88021 9.88281 4.29688 9.64844 3.75C9.41406 3.20312 9.09115 2.72656 8.67969 2.32031C8.26823 1.91406 7.79167 1.59375 7.25 1.35938C6.70833 1.125 6.125 1.00521 5.5 1C4.88021 1 4.29688 1.11719 3.75 1.35156C3.20312 1.58594 2.72656 1.90885 2.32031 2.32031C1.91406 2.73177 1.59375 3.20833 1.35938 3.75C1.125 4.29167 1.00521 4.875 1 5.5C1 6.11979 1.11719 6.70312 1.35156 7.25C1.58594 7.79688 1.90885 8.27344 2.32031 8.67969C2.73177 9.08594 3.20833 9.40625 3.75 9.64062C4.29167 9.875 4.875 9.99479 5.5 10C6.00521 10 6.5 9.91406 6.98438 9.74219C7.46875 9.57031 7.90885 9.32292 8.30469 9H9V11H11V13H13V15H15V12.7109ZM4 3C4.14062 3 4.27083 3.02604 4.39062 3.07812C4.51042 3.13021 4.61458 3.20052 4.70312 3.28906C4.79167 3.3776 4.86458 3.48438 4.92188 3.60938C4.97917 3.73438 5.00521 3.86458 5 4C5 4.14062 4.97396 4.27083 4.92188 4.39062C4.86979 4.51042 4.79948 4.61458 4.71094 4.70312C4.6224 4.79167 4.51562 4.86458 4.39062 4.92188C4.26562 4.97917 4.13542 5.00521 4 5C3.85938 5 3.72917 4.97396 3.60938 4.92188C3.48958 4.86979 3.38542 4.79948 3.29688 4.71094C3.20833 4.6224 3.13542 4.51562 3.07812 4.39062C3.02083 4.26562 2.99479 4.13542 3 4C3 3.85938 3.02604 3.72917 3.07812 3.60938C3.13021 3.48958 3.20052 3.38542 3.28906 3.29688C3.3776 3.20833 3.48438 3.13542 3.60938 3.07812C3.73438 3.02083 3.86458 2.99479 4 3Z" fill="currentColor" />
    </g>
    <defs>
      <clipPath id="clip0_perm_shield">
        <rect width="16" height="16" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

const CustomFileImageIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" fill="none" className={className}>
    <path d="M4.5 16.5C4.10218 16.5 3.72064 16.342 3.43934 16.0607C3.15804 15.7794 3 15.3978 3 15V3C3 2.60218 3.15804 2.22065 3.43934 1.93934C3.72064 1.65804 4.10218 1.5 4.5 1.5H10.5C10.7374 1.49962 10.9726 1.5462 11.1919 1.63708C11.4112 1.72795 11.6104 1.86132 11.778 2.0295L14.469 4.7205C14.6376 4.88813 14.7714 5.08751 14.8625 5.30712C14.9537 5.52674 15.0004 5.76223 15 6V15C15 15.3978 14.842 15.7794 14.5607 16.0607C14.2794 16.342 13.8978 16.5 13.5 16.5H4.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10.5 1.5V5.25C10.5 5.44891 10.579 5.63968 10.7197 5.78033C10.8603 5.92098 11.0511 6 11.25 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8.625 12.75C9.66053 12.75 10.5 11.9105 10.5 10.875C10.5 9.83947 9.66053 9 8.625 9C7.58947 9 6.75 9.83947 6.75 10.875C6.75 11.9105 7.58947 12.75 8.625 12.75Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9.975 12.2266L11.25 13.5016" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type SidebarMenuInfo = {
  icon: React.ComponentType<{ className?: string }>;
  name: string;
};

const SIDEBAR_MENU_MAP: Record<string, SidebarMenuInfo> = {
  '/banner':         { icon: ImageIcon,           name: '홈 배너 관리' },
  '/image-analysis': { icon: CustomFileImageIcon,  name: '이미지 분석 목록' },
  '/suggestions':    { icon: MessageSquare,        name: '유저 제안 관리' },
  '/faq':            { icon: HelpCircle,           name: 'FAQ 관리' },
  '/countries':      { icon: Flag,                 name: '국가 관리' },
  '/accounts':       { icon: Users,                name: '계정 관리' },
  '/permissions':    { icon: CustomShieldIcon,     name: '권한 관리' },
  '/activity-log':   { icon: CustomHistoryIcon,    name: '관리자 활동 로그' },
};

const SIDEBAR_PATH_ORDER = [
  '/banner', '/image-analysis', '/suggestions', '/faq',
  '/countries', '/accounts', '/permissions', '/activity-log',
];

type PermissionState = Record<
  string,
  { canRead: boolean; canWrite: boolean; canDelete: boolean }
>;

function buildPermissionState(
  menus: AdminMenuResponse[],
  serverPerms?: AuthGroupMenuPermission[] | null,
): PermissionState {
  const state: PermissionState = {};
  const byMenuId = new Map<string, AuthGroupMenuPermission>();
  (serverPerms || []).forEach((p) => byMenuId.set(p.menuId, p));
  menus.forEach((m) => {
    const p = byMenuId.get(m.id);
    state[m.id] = {
      canRead: p?.canRead ?? false,
      canWrite: p?.canWrite ?? false,
      canDelete: p?.canDelete ?? false,
    };
  });
  return state;
}

function sortMenusBySidebar(menus: AdminMenuResponse[]): AdminMenuResponse[] {
  return [...menus].sort((a, b) => {
    const aIdx = a.path ? SIDEBAR_PATH_ORDER.indexOf(a.path) : -1;
    const bIdx = b.path ? SIDEBAR_PATH_ORDER.indexOf(b.path) : -1;
    if (aIdx === -1 && bIdx === -1) return a.displayOrder - b.displayOrder;
    if (aIdx === -1) return 1;
    if (bIdx === -1) return -1;
    return aIdx - bIdx;
  });
}

export default function PermissionsPage() {
  const queryClient = useQueryClient();
  const { canRead, canWrite, canDelete } = usePagePermission('/permissions');

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState('10');
  const size = parseInt(pageSize, 10);

  const { data: listData, isLoading: listLoading, isError: listError, error: listErrorObj } = useQuery({
    queryKey: ['auth-groups', { page, size }],
    queryFn: () => authGroupApi.list({ page, size }),
  });

  const { data: menus } = useQuery({
    queryKey: ['auth-groups', 'menus'],
    queryFn: () => authGroupApi.menus(),
  });

  const sortedMenus = sortMenusBySidebar(menus ?? []);

  const groups = listData?.content ?? [];
  const totalPages = listData?.totalPages ?? 0;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [active, setActive] = useState(true);
  const [perms, setPerms] = useState<PermissionState>({});
  const [groupNameError, setGroupNameError] = useState('');

  const { data: detailData } = useQuery({
    queryKey: ['auth-group', editingId],
    queryFn: () => authGroupApi.detail(editingId!),
    enabled: !!editingId,
  });

  useEffect(() => {
    if (editingId && detailData) {
      setGroupName(detailData.groupName);
      setActive(detailData.active);
      setPerms(buildPermissionState(menus ?? [], detailData.menuPermissions));
    } else if (!editingId) {
      setGroupName('');
      setActive(true);
      setPerms(buildPermissionState(menus ?? []));
    }
    setGroupNameError('');
  }, [editingId, detailData, menus]);

  const isFormValid = groupName.trim().length > 0;

  const handleAdd = () => {
    setEditingId(null);
    setShowForm(true);
  };
  const handleEdit = (g: AuthGroupResponse) => {
    setEditingId(g.id);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const buildMenuPermissionsPayload = () =>
    (menus ?? []).map((m) => ({
      menuId: m.id,
      canRead: perms[m.id]?.canRead ?? false,
      canWrite: perms[m.id]?.canWrite ?? false,
      canDelete: perms[m.id]?.canDelete ?? false,
    }));

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await authGroupApi.create({
        groupName: groupName.trim(),
        active,
      });
      await authGroupApi.update(created.id, {
        groupName: created.groupName,
        displayOrder: created.displayOrder,
        active: created.active,
        menuPermissions: buildMenuPermissionsPayload(),
      });
    },
    onSuccess: () => {
      toast.success('저장되었습니다.');
      queryClient.refetchQueries({ queryKey: ['auth-groups'] });
      handleCloseForm();
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '저장에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      authGroupApi.update(editingId!, {
        groupName: groupName.trim(),
        active,
        menuPermissions: buildMenuPermissionsPayload(),
      }),
    onSuccess: () => {
      toast.success('권한이 수정되었습니다.');
      queryClient.refetchQueries({ queryKey: ['auth-groups'] });
      queryClient.invalidateQueries({ queryKey: ['auth-group', editingId] });
    },
    onError: (e) => {
      toast.error(
        e instanceof ApiError ? e.message : '권한 수정에 실패했습니다. 다시 시도해주세요.',
      );
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<AuthGroupResponse | null>(null);
  const [deleteBlockedOpen, setDeleteBlockedOpen] = useState(false);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => authGroupApi.remove(id),
    onSuccess: (_, deletedId) => {
      toast.success('삭제되었습니다.');
      queryClient.refetchQueries({ queryKey: ['auth-groups'] });
      if (deletedId === editingId) handleCloseForm();
    },
  });

  const handleSave = () => {
    if (!groupName.trim()) {
      setGroupNameError('권한명을 입력해주세요.');
      return;
    }
    setGroupNameError('');
    if (editingId) updateMutation.mutate();
    else createMutation.mutate();
  };

  const togglePerm = (
    menuId: string,
    field: 'canRead' | 'canWrite' | 'canDelete',
    next: boolean,
  ) => {
    setPerms((prev) => {
      const cur = prev[menuId] ?? {
        canRead: false,
        canWrite: false,
        canDelete: false,
      };
      const updated = { ...cur, [field]: next };
      if (next) {
        if (field === 'canWrite') updated.canRead = true;
        if (field === 'canDelete') {
          updated.canRead = true;
          updated.canWrite = true;
        }
      } else {
        if (field === 'canRead') {
          updated.canWrite = false;
          updated.canDelete = false;
        }
        if (field === 'canWrite') {
          updated.canDelete = false;
        }
      }
      return { ...prev, [menuId]: updated };
    });
  };

  const renderMenuIcon = (menu: AdminMenuResponse) => {
    const sidebarInfo = menu.path ? SIDEBAR_MENU_MAP[menu.path] : undefined;
    const Icon = sidebarInfo?.icon;
    return Icon ? <Icon className="w-4 h-4 text-gray-500" /> : null;
  };

  const getMenuName = (menu: AdminMenuResponse) => {
    if (menu.path) {
      const sidebarInfo = SIDEBAR_MENU_MAP[menu.path];
      if (sidebarInfo) return sidebarInfo.name;
    }
    return menu.menuName;
  };

  if (!canRead) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-[15px] text-gray-400">
        접근 권한이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full flex gap-6 pb-12">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <PageTitle>권한 관리</PageTitle>
          <div className="flex items-center gap-3">
            {canWrite && !showForm && (
              <Button
                onClick={handleAdd}
                className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-10 px-4"
              >
                <Plus className="w-4 h-4 mr-2" />
                권한 추가
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 flex flex-col shadow-sm">
          <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
            <span className="text-[13px] text-gray-500">페이지당</span>
            <Select
              value={pageSize}
              onValueChange={(val) => {
                setPageSize(val);
                setPage(0);
              }}
            >
              <SelectTrigger className="w-[80px] h-10 text-sm border-gray-200">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <AdminTableHeaderRow>
                  <AdminTableHead className="px-6 py-4">권한명</AdminTableHead>
                  <AdminTableHead className="px-6 py-4 w-32 text-right">관리</AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listLoading && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                      불러오는 중...
                    </td>
                  </tr>
                )}
                {listError && !listLoading && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-red-500">
                      {listErrorObj instanceof ApiError
                        ? listErrorObj.message
                        : '목록을 불러오지 못했습니다.'}
                    </td>
                  </tr>
                )}
                {!listLoading && !listError && groups.length === 0 && (
                  <tr>
                    <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                      등록된 권한 그룹이 없습니다.
                    </td>
                  </tr>
                )}
                {groups.map((g) => (
                  <tr key={g.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{g.groupName}</span>
                      {!g.active && (
                        <span className="ml-2 text-[11px] font-[600] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        {canWrite && <EditButton onClick={() => handleEdit(g)} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 0 && (
            <div className="flex justify-end p-4 items-center space-x-1 bg-white border-t border-gray-100">
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? 'primary' : 'outline'}
                  size="icon"
                  className={`w-8 h-8 p-0 ${
                    p === page
                      ? 'bg-[#4186FF] text-white hover:bg-blue-600 border-transparent shadow-sm'
                      : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                className="w-8 h-8 p-0 border-gray-200 text-gray-400 hover:bg-gray-50"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className={`transition-all duration-300 overflow-hidden flex-shrink-0 ${showForm ? 'w-[420px]' : 'w-0'}`}>
        <div className="w-[420px]">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-[16px] font-[700] text-[#18181B]">
                {editingId ? '권한 편집' : '권한 추가'}
              </h2>
              {editingId && detailData && canDelete && (
                <DeleteButton onClick={() => setDeleteTarget(detailData)} />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[14px] font-[600] text-[#18181B]">
                권한명 <span className="text-red-500">*</span>
              </Label>
              <Input
                value={groupName}
                onChange={(e) => {
                  setGroupName(e.target.value);
                  if (groupNameError) setGroupNameError('');
                }}
                placeholder="권한명을 입력해주세요"
                maxLength={100}
                className={`h-11 ${groupNameError ? 'border-red-400' : ''}`}
              />
              {groupNameError && (
                <p className="text-[12px] text-red-500">{groupNameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-[14px] font-[600] text-[#18181B]">권한설정</Label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <AdminTableHeaderRow className="border-gray-200 whitespace-normal">
                      <AdminTableHead className="p-3">페이지</AdminTableHead>
                      <AdminTableHead className="p-3 text-center">읽기</AdminTableHead>
                      <AdminTableHead className="p-3 text-center">쓰기</AdminTableHead>
                      <AdminTableHead className="p-3 text-center">삭제</AdminTableHead>
                    </AdminTableHeaderRow>
                  </thead>
                  <tbody>
                    {sortedMenus.map((m) => {
                      const p = perms[m.id] ?? {
                        canRead: false,
                        canWrite: false,
                        canDelete: false,
                      };
                      return (
                        <tr
                          key={m.id}
                          className="border-b border-gray-200 last:border-0 hover:bg-gray-50"
                        >
                          <td className="p-3 text-gray-600">
                            <div className="flex items-center space-x-2">
                              {renderMenuIcon(m)}
                              <span>{getMenuName(m)}</span>
                            </div>
                          </td>
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={p.canRead}
                              onCheckedChange={(c) =>
                                togglePerm(m.id, 'canRead', c as boolean)
                              }
                              className="data-[state=checked]:bg-[#4186FF] data-[state=checked]:border-[#4186FF]"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={p.canWrite}
                              onCheckedChange={(c) =>
                                togglePerm(m.id, 'canWrite', c as boolean)
                              }
                              className="data-[state=checked]:bg-[#4186FF] data-[state=checked]:border-[#4186FF]"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <Checkbox
                              checked={p.canDelete}
                              onCheckedChange={(c) =>
                                togglePerm(m.id, 'canDelete', c as boolean)
                              }
                              className="data-[state=checked]:bg-[#4186FF] data-[state=checked]:border-[#4186FF]"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 flex flex-col space-y-2">
              <Button
                disabled={
                  !isFormValid || createMutation.isPending || updateMutation.isPending
                }
                onClick={handleSave}
                style={
                  !isFormValid || createMutation.isPending || updateMutation.isPending
                    ? { backgroundColor: '#E4E4E7', color: '#A1A1AA' }
                    : undefined
                }
                className="w-full bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-11 disabled:hover:bg-[#E4E4E7]"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? '저장 중...'
                  : '저장'}
              </Button>
              <Button
                variant="outline"
                className="w-full h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={handleCloseForm}
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="권한 그룹을 삭제하시겠어요?"
        description="삭제 후에는 복구할 수 없습니다."
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={async () => {
          if (!deleteTarget) return;
          const targetId = deleteTarget.id;
          setDeleteTarget(null);
          try {
            await deleteMutation.mutateAsync(targetId);
          } catch (e) {
            if (e instanceof ApiError && e.code === 'AUTH_GROUP_IN_USE') {
              setDeleteBlockedOpen(true);
            } else {
              toast.error('삭제에 실패했습니다. 다시 시도해주세요.');
            }
          }
        }}
      />

      <ConfirmModal
        isOpen={deleteBlockedOpen}
        onClose={() => setDeleteBlockedOpen(false)}
        title={"계정에 연결된 권한이 있어 삭제할 수 없습니다.\n해당 권한을 해제한 후 다시 시도해 주세요."}
        titleClassName="h-[140px]"
        variant="single"
        confirmText="확인"
        onConfirm={() => setDeleteBlockedOpen(false)}
      />
    </div>
  );
}
