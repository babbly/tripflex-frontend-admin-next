'use client';

// 언어 탭 — api.json: /api/admin/languages (CRUD)

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
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
import { languageApi } from '@/lib/language-api';
import { LanguageResponse } from '@/types/language';
import { ApiError } from '@/types/api';

export default function LanguageTab() {
  const queryClient = useQueryClient();

  // 페이지네이션 제거 — 순서 변경 기능 추가 시 재도입.
  // const [page, setPage] = useState(0);
  // const [pageSize, setPageSize] = useState('10');
  // const size = parseInt(pageSize, 10);
  const FETCH_SIZE = 500;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['languages'],
    queryFn: () => languageApi.list({ page: 0, size: FETCH_SIZE }),
  });

  const languages = data?.content ?? [];

  const [editing, setEditing] = useState<LanguageResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [languageCode, setLanguageCode] = useState('');
  const [nameKo, setNameKo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameNative, setNameNative] = useState('');
  const [rtl, setRtl] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (editing) {
      setLanguageCode(editing.languageCode);
      setNameKo(editing.nameKo);
      setNameEn(editing.nameEn);
      setNameNative(editing.nameNative ?? '');
      setRtl(editing.rtl);
      setDisplayOrder(editing.displayOrder ?? 0);
      setActive(editing.active);
    } else {
      setLanguageCode('');
      setNameKo('');
      setNameEn('');
      setNameNative('');
      setRtl(false);
      setDisplayOrder(0);
      setActive(true);
    }
  }, [editing]);

  const createMutation = useMutation({
    mutationFn: () =>
      languageApi.create({
        languageCode: languageCode.trim(),
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim(),
        nameNative: nameNative || undefined,
        rtl,
        displayOrder,
        active,
      }),
    onSuccess: () => {
      toast.success('등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      languageApi.update(editing!.id, {
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim(),
        nameNative: nameNative || undefined,
        rtl,
        displayOrder,
        active,
      }),
    onSuccess: () => {
      toast.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => languageApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['languages'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '삭제에 실패했습니다.');
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<LanguageResponse | null>(null);

  const handleSave = () => {
    if (!editing && !languageCode.trim()) {
      toast.error('언어 코드를 입력해주세요.');
      return;
    }
    if (!nameKo.trim() || !nameEn.trim()) {
      toast.error('한글명과 영문명을 모두 입력해주세요.');
      return;
    }
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-end">
          <Button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="bg-[#4186FF] hover:bg-blue-600 text-white text-[14px] font-semibold h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            언어 추가
          </Button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* 페이지당 선택 — 페이지네이션 재도입 시 함께 활성화 */}
          {/* <div className="flex justify-end p-4 border-b border-gray-100 items-center gap-2">
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
          </div> */}
          <table className="w-full text-left border-collapse">
            <thead>
              <AdminTableHeaderRow>
                <AdminTableHead className="px-6 py-4">언어명</AdminTableHead>
                <AdminTableHead className="px-6 py-4 text-right w-[120px]">관리</AdminTableHead>
              </AdminTableHeaderRow>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                    불러오는 중...
                  </td>
                </tr>
              )}
              {isError && !isLoading && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-sm text-red-500">
                    {error instanceof ApiError ? error.message : '목록을 불러오지 못했습니다.'}
                  </td>
                </tr>
              )}
              {!isLoading && !isError && languages.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                    등록된 언어가 없습니다.
                  </td>
                </tr>
              )}
              {languages.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-medium text-gray-900">{l.nameKo}</span>
                    {!l.active && (
                      <span className="ml-2 text-[11px] font-[600] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                        비활성
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <EditButton
                        onClick={() => {
                          setEditing(l);
                          setShowForm(true);
                        }}
                      />
                      <DeleteButton onClick={() => setDeleteTarget(l)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* 페이지네이션 — 순서 변경 기능 적용 후 다시 살릴 예정. */}
          {/* {totalPages > 0 && (
            <div className="flex justify-end p-4 items-center gap-1 bg-white border-t border-gray-100">
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
          )} */}
        </div>
      </div>

      {showForm && (
        <div className="w-[360px] flex flex-col gap-4 shrink-0">
          <Card className="p-6 border-gray-200 shadow-sm flex flex-col gap-6">
            <h3 className="font-bold text-[18px] text-gray-900">
              {editing ? '언어 편집' : '언어 추가'}
            </h3>
            <div className="h-[1px] bg-gray-100 w-full" />
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  언어명 (ex. 한국어)
                </label>
                <Input
                  placeholder="언어명을 입력해주세요"
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  maxLength={100}
                  className="border-gray-200 h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  언어명 영문 (ex. Korean)
                </label>
                <Input
                  placeholder="English Name"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  maxLength={100}
                  className="border-gray-200 h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  언어코드 (ex. ko)
                </label>
                <Input
                  placeholder="Language Code"
                  value={languageCode}
                  onChange={(e) => setLanguageCode(e.target.value)}
                  maxLength={10}
                  disabled={!!editing}
                  className={`border-gray-200 h-11 ${editing ? 'bg-gray-50 text-gray-500' : ''}`}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-4">
              <Button
                disabled={createMutation.isPending || updateMutation.isPending}
                onClick={handleSave}
                className="w-full bg-[#4186FF] hover:bg-blue-600 text-white h-11 font-bold"
              >
                {createMutation.isPending || updateMutation.isPending ? '저장 중...' : '저장'}
              </Button>
              <Button
                variant="outline"
                className="w-full border-gray-200 h-11 text-gray-700 font-bold hover:bg-gray-50"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
              >
                취소
              </Button>
            </div>
          </Card>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="언어를 삭제하시겠어요?"
        description={`삭제 시 "${deleteTarget?.nameKo}" 언어의 정보가 모두 제거됩니다.`}
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
