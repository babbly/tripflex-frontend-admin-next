'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  BarChart,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Globe,
  HelpCircle,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Scan,
  Shield,
  Tag,
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

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Image: ImageIcon,
  Shield,
  Scan,
  Globe,
  Users,
  MessageSquare,
  HelpCircle,
  ClipboardList,
  FileText,
  Tag,
  BarChart,
  BookOpen,
};

type PermissionState = Record<
  string, // menuId
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

export default function PermissionsPage() {
  const queryClient = useQueryClient();

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

  const groups = listData?.content ?? [];
  const totalPages = listData?.totalPages ?? 0;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
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
      setDescription(detailData.description ?? '');
      setActive(detailData.active);
      setPerms(buildPermissionState(menus ?? [], detailData.menuPermissions));
    } else if (!editingId) {
      setGroupName('');
      setDescription('');
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
        description: description || undefined,
        active,
      });
      await authGroupApi.update(created.id, {
        groupName: created.groupName,
        description: created.description,
        displayOrder: created.displayOrder,
        active: created.active,
        menuPermissions: buildMenuPermissionsPayload(),
      });
    },
    onSuccess: () => {
      toast.success('저장되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['auth-groups'] });
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
        description: description || undefined,
        active,
        menuPermissions: buildMenuPermissionsPayload(),
      }),
    onSuccess: () => {
      toast.success('권한이 수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['auth-groups'] });
      queryClient.invalidateQueries({ queryKey: ['auth-group', editingId] });
      handleCloseForm();
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
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['auth-groups'] });
      if (deleteTarget?.id === editingId) handleCloseForm();
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

  // 권한 자동 의존성:
  // - 쓰기 선택 시 읽기 자동 포함
  // - 삭제 선택 시 읽기 + 쓰기 자동 포함
  // - 읽기 해제 시 쓰기/삭제 자동 해제
  // - 쓰기 해제 시 삭제 자동 해제
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
    const Icon = ICON_MAP[menu.icon ?? ''];
    return Icon ? <Icon className="w-4 h-4 text-gray-500" /> : null;
  };

  return (
    <div className="w-full flex gap-6 pb-12">
      <div className="flex-1 space-y-4">
        <div className="flex justify-between items-center">
          <PageTitle>권한 관리</PageTitle>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleAdd}
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-10 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              권한 추가
            </Button>
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
                        <EditButton onClick={() => handleEdit(g)} />
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

      {showForm && (
        <div className="w-[420px] flex-shrink-0">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
              <h2 className="text-[16px] font-[700] text-[#18181B]">
                {editingId ? '권한 편집' : '권한 추가'}
              </h2>
              {editingId && detailData && (
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
              <Label className="text-[14px] font-[600] text-[#18181B]">설명</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="설명을 입력해주세요"
                maxLength={500}
                className="h-11"
              />
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
                    {(menus ?? []).map((m) => {
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
                              <span>{m.menuName}</span>
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
      )}

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
            if (e instanceof ApiError && e.status === 409) {
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
        title="삭제할 수 없습니다"
        description={"계정에 연결된 권한이 있어 삭제할 수 없습니다.\n해당 권한을 해제한 후 다시 시도해 주세요."}
        variant="single"
        confirmText="확인"
        onConfirm={() => setDeleteBlockedOpen(false)}
      />
    </div>
  );
}
