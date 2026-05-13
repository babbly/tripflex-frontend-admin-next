'use client';

// 국가 탭 — api.json: /api/admin/countries (CRUD)
// 국기 업로드는 외부 키 대기 (api.md). 임시로 flagImageUrl 텍스트 입력.

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Info, Plus, Upload } from 'lucide-react';
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
import { countryApi } from '@/lib/country-api';
import { CountryResponse } from '@/types/country';
import { ApiError } from '@/types/api';

export default function CountryTab() {
  const queryClient = useQueryClient();

  // 페이지네이션 제거 — 순서 변경 기능 추가 시 재도입.
  // const [page, setPage] = useState(0);
  // const [pageSize, setPageSize] = useState('10');
  // const size = parseInt(pageSize, 10);
  const FETCH_SIZE = 500;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['countries'],
    queryFn: () => countryApi.list({ page: 0, size: FETCH_SIZE }),
  });

  const countries = data?.content ?? [];

  const [editing, setEditing] = useState<CountryResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [countryCode, setCountryCode] = useState('');
  const [nameKo, setNameKo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [flagImageUrl, setFlagImageUrl] = useState('');
  const [defaultLanguageCode, setDefaultLanguageCode] = useState('');
  const [defaultCurrencyCode, setDefaultCurrencyCode] = useState('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);

  // editing 변경 시 폼 hydrate
  useEffect(() => {
    if (editing) {
      setCountryCode(editing.countryCode);
      setNameKo(editing.nameKo);
      setNameEn(editing.nameEn);
      setFlagImageUrl(editing.flagImageUrl ?? '');
      setDefaultLanguageCode(editing.defaultLanguageCode ?? '');
      setDefaultCurrencyCode(editing.defaultCurrencyCode ?? '');
      setDisplayOrder(editing.displayOrder ?? 0);
      setActive(editing.active);
    } else {
      setCountryCode('');
      setNameKo('');
      setNameEn('');
      setFlagImageUrl('');
      setDefaultLanguageCode('');
      setDefaultCurrencyCode('');
      setDisplayOrder(0);
      setActive(true);
    }
  }, [editing]);

  const createMutation = useMutation({
    mutationFn: () =>
      countryApi.create({
        countryCode: countryCode.trim().toUpperCase(),
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim(),
        flagImageUrl: flagImageUrl || undefined,
        defaultLanguageCode: defaultLanguageCode || undefined,
        defaultCurrencyCode: defaultCurrencyCode || undefined,
        displayOrder,
        active,
      }),
    onSuccess: () => {
      toast.success('등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      countryApi.update(editing!.id, {
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim(),
        flagImageUrl: flagImageUrl || undefined,
        defaultLanguageCode: defaultLanguageCode || undefined,
        defaultCurrencyCode: defaultCurrencyCode || undefined,
        displayOrder,
        active,
      }),
    onSuccess: () => {
      toast.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => countryApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '삭제에 실패했습니다.');
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<CountryResponse | null>(null);

  const handleSave = () => {
    if (!editing && !countryCode.trim()) {
      toast.error('국가 코드를 입력해주세요.');
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
            국가 추가
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
                <AdminTableHead className="px-6 py-4">국가명</AdminTableHead>
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
              {!isLoading && !isError && countries.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                    등록된 국가가 없습니다.
                  </td>
                </tr>
              )}
              {countries.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {c.flagImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.flagImageUrl}
                          alt={c.nameKo}
                          className="w-6 h-4 object-cover rounded-sm shadow-sm"
                        />
                      ) : (
                        <div className="w-6 h-4 bg-gray-100 rounded-sm" />
                      )}
                      <span className="text-[14px] font-medium text-gray-900">
                        {c.nameKo}
                      </span>
                      {!c.active && (
                        <span className="text-[11px] font-[600] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                          비활성
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <EditButton
                        onClick={() => {
                          setEditing(c);
                          setShowForm(true);
                        }}
                      />
                      <DeleteButton onClick={() => setDeleteTarget(c)} />
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
              {editing ? '국가 편집' : '국가 추가'}
            </h3>
            <div className="h-[1px] bg-gray-100 w-full" />
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가명 (ex. 대한민국)
                </label>
                <Input
                  placeholder="국가명을 입력해주세요"
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  maxLength={100}
                  className="border-gray-200 h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가명 영문 (ex. Korea)
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
                  ISO 국가코드 (ex. KR)
                </label>
                <Input
                  placeholder="ISO Code"
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  maxLength={5}
                  disabled={!!editing}
                  className={`border-gray-200 h-11 ${editing ? 'bg-gray-50 text-gray-500' : ''}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가 이미지
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#4186FF]">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-semibold text-gray-900">
                      이미지를 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-[12px] text-gray-500 mt-1">PNG, JPG, GIF (최대 5MB)</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-2 border-gray-200 h-11 text-gray-700 font-semibold"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  파일 선택
                </Button>
                <p className="text-[11px] text-gray-400 flex items-start gap-1 mt-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  파일 업로드는 AWS 키 수령 후 제공 예정입니다.
                </p>
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
        title="국가를 삭제하시겠어요?"
        description={`삭제 시 "${deleteTarget?.nameKo}" 국가의 정보가 모두 제거됩니다.`}
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
