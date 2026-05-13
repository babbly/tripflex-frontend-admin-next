'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { PageTitle } from '@/components/ui/page-title';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
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
import { adminAccountApi } from '@/lib/admin-account-api';
import { authGroupApi } from '@/lib/auth-group-api';
import {
  AdminAccountResponse,
  AdminRole,
} from '@/types/admin-account';
import { ApiError } from '@/types/api';

const AUTH_GROUP_NONE = '__NONE__';

const ROLE_LABELS: Record<AdminRole, string> = {
  SUPER: '슈퍼 관리자',
  OPERATOR: '운영자',
};

export default function AccountsPage() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState('10');
  const [keywordInput, setKeywordInput] = useState('');
  const [keyword, setKeyword] = useState('');
  const size = parseInt(pageSize, 10);

  const { data: listData, isLoading: listLoading, isError: listError, error: listErrorObj } = useQuery({
    queryKey: ['admin-accounts', { page, size, keyword }],
    queryFn: () =>
      adminAccountApi.list({ page, size, keyword: keyword || undefined }),
  });

  const { data: authGroupsData } = useQuery({
    queryKey: ['auth-groups-all'],
    queryFn: () => authGroupApi.list({ page: 0, size: 500 }),
  });
  const authGroups = authGroupsData?.content ?? [];

  const accounts = listData?.content ?? [];
  const totalPages = listData?.totalPages ?? 0;

  const [editing, setEditing] = useState<AdminAccountResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('OPERATOR');
  const [authGroupId, setAuthGroupId] = useState<string>('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (editing) {
      setLoginId(editing.loginId);
      setName(editing.name);
      setEmail(editing.email ?? '');
      setRole((editing.role as AdminRole) || 'OPERATOR');
      setAuthGroupId(editing.authGroupId ?? '');
      setActive(editing.active);
    } else {
      setLoginId('');
      setName('');
      setEmail('');
      setRole('OPERATOR');
      setAuthGroupId('');
      setActive(true);
    }
  }, [editing]);

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleEdit = (a: AdminAccountResponse) => {
    setEditing(a);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const createMutation = useMutation({
    mutationFn: () =>
      adminAccountApi.create({
        loginId: loginId.trim(),
        name: name.trim(),
        email: email.trim() || undefined,
        role,
        authGroupId: authGroupId || undefined,
      }),
    onSuccess: () => {
      toast.success('계정이 등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      handleCloseForm();
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminAccountApi.update(editing!.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        role,
        authGroupId: authGroupId || undefined,
        active,
      }),
    onSuccess: () => {
      toast.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      handleCloseForm();
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '수정에 실패했습니다.');
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<AdminAccountResponse | null>(null);
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminAccountApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['admin-accounts'] });
      if (deleteTarget?.id === editing?.id) handleCloseForm();
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '삭제에 실패했습니다.');
    },
  });

  const handleSave = () => {
    if (!editing && !loginId.trim()) {
      toast.error('아이디를 입력해주세요.');
      return;
    }
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  const applySearch = () => {
    setKeyword(keywordInput.trim());
    setPage(0);
  };

  const findGroup = (id?: string) =>
    id ? authGroups.find((g) => g.id === id) : undefined;

  return (
    <div className="w-full flex gap-6 pb-12">
      <div className="flex-1 flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <PageTitle>계정 관리</PageTitle>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative w-[280px]">
              <Input
                type="text"
                className="pl-9 h-10 border-gray-200 bg-white text-[#71717A] placeholder:text-[#71717A]"
                placeholder="아이디, 이름 검색..."
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') applySearch();
                }}
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-400" />
              </div>
            </div>
            <Button
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] h-10 px-6"
              onClick={applySearch}
            >
              검색
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleAdd}
              className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-semibold leading-normal h-9 px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              계정 추가
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
                  <AdminTableHead className="px-6 py-4">아이디</AdminTableHead>
                  <AdminTableHead className="px-6 py-4">이름</AdminTableHead>
                  <AdminTableHead className="px-6 py-4">권한</AdminTableHead>
                  <AdminTableHead className="px-6 py-4 text-center">상태</AdminTableHead>
                  <AdminTableHead className="px-6 py-4 text-right">관리</AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {listLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      불러오는 중...
                    </td>
                  </tr>
                )}
                {listError && !listLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-red-500">
                      {listErrorObj instanceof ApiError
                        ? listErrorObj.message
                        : '목록을 불러오지 못했습니다.'}
                    </td>
                  </tr>
                )}
                {!listLoading && !listError && accounts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      등록된 계정이 없습니다.
                    </td>
                  </tr>
                )}
                {accounts.map((a) => {
                  const g = findGroup(a.authGroupId);
                  return (
                    <tr key={a.id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{a.loginId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{a.name}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className="bg-[#eef1ff] text-[#1C2340] text-[11px] font-[600] leading-normal hover:bg-[#eef1ff]"
                          >
                            {ROLE_LABELS[(a.role as AdminRole) || 'OPERATOR'] || a.role}
                          </Badge>
                          {g && (
                            <span className="text-[12px] text-gray-500">{g.groupName}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <Badge
                            variant="secondary"
                            className={`font-semibold flex items-center gap-1.5 ${
                              a.active
                                ? 'bg-[#D1FAE5] text-[#10B981] hover:bg-[#D1FAE5]'
                                : 'bg-[#FEE2E2] text-[#EF4444] hover:bg-[#FEE2E2]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                a.active ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                              }`}
                            />
                            {a.active ? '활성' : '비활성'}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <EditButton onClick={() => handleEdit(a)} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
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

      {/* 우측 편집 패널 */}
      {showForm && (
        <div
          key={editing?.id || 'new'}
          className="w-[320px] bg-white rounded-lg border border-gray-200 shadow-sm p-[20px] flex flex-col shrink-0 self-start gap-[16px]"
        >
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">
              {editing ? '계정 편집' : '계정 추가'}
            </h3>
            {editing && (
              <DeleteButton onClick={() => setDeleteTarget(editing)} />
            )}
          </div>

          <div className="h-[1px] bg-[#E4E4E7] self-stretch" />

          <div className="flex flex-col gap-[8px]">
            <label className="text-sm font-semibold text-gray-900">아이디</label>
            <Input
              type="text"
              placeholder="아이디를 입력해주세요"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              maxLength={50}
              disabled={!!editing}
              className={`h-11 ${editing ? 'bg-gray-50 text-gray-500 border-gray-200' : 'border-blue-400 focus-visible:ring-[#4186FF] focus-visible:border-[#4186FF]'}`}
            />
            {!editing && (
              <p className="text-[11px] text-gray-400">
                생성 시 초기 비밀번호는 “0000”으로 자동 설정되며, 해당 계정의 첫 로그인 시 변경이 강제됩니다.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-sm font-semibold text-gray-900">이름</label>
            <Input
              type="text"
              placeholder="이름을 입력해주세요"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              className="h-11 border-gray-200"
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-sm font-semibold text-gray-900">이메일</label>
            <Input
              type="email"
              placeholder="이메일을 입력해주세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={100}
              className="h-11 border-gray-200"
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-sm font-semibold text-gray-900">역할</label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminRole)}>
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPER">슈퍼 관리자 (SUPER)</SelectItem>
                <SelectItem value="OPERATOR">운영자 (OPERATOR)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="text-sm font-semibold text-gray-900">권한 그룹</label>
            <Select
              value={authGroupId || AUTH_GROUP_NONE}
              onValueChange={(v) =>
                setAuthGroupId(v === AUTH_GROUP_NONE ? '' : v)
              }
            >
              <SelectTrigger className="h-11 border-gray-200">
                <SelectValue placeholder="없음" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AUTH_GROUP_NONE}>없음</SelectItem>
                {authGroups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.groupName} ({g.groupCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editing && (
            <div className="flex flex-col gap-[8px]">
              <label className="text-sm font-semibold text-gray-900">활성화</label>
              <Select
                value={active ? 'ACTIVE' : 'INACTIVE'}
                onValueChange={(v) => setActive(v === 'ACTIVE')}
              >
                <SelectTrigger className="h-11 border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="INACTIVE">비활성</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-[12px] mt-2">
            <Button
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={handleSave}
              className="w-full bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-[600] leading-normal h-10"
            >
              {createMutation.isPending || updateMutation.isPending
                ? '저장 중...'
                : '저장'}
            </Button>
            <Button
              variant="outline"
              className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 h-10 font-semibold"
              onClick={handleCloseForm}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="계정을 삭제하시겠어요?"
        description="삭제 후에는 복구할 수 없습니다."
        variant="double"
        confirmText="삭제"
        cancelText="취소"
        confirmColor="red"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}
