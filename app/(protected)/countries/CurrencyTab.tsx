'use client';

// 통화 탭 — api.json: /api/admin/currencies (CRUD)
// 주의: API의 통화→국가는 1:1 (countryId). 기존 UI의 다중 국가 매핑은 단일 선택으로 변경.

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
import { currencyApi } from '@/lib/currency-api';
import { countryApi } from '@/lib/country-api';
import { CurrencyResponse } from '@/types/currency';
import { ApiError } from '@/types/api';

const COUNTRY_PICK_NONE = '__NONE__';

export default function CurrencyTab() {
  const queryClient = useQueryClient();

  // 페이지네이션 제거 — 순서 변경 기능 추가 시 재도입.
  // const [page, setPage] = useState(0);
  // const [pageSize, setPageSize] = useState('10');
  // const size = parseInt(pageSize, 10);
  const FETCH_SIZE = 500;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => currencyApi.list({ page: 0, size: FETCH_SIZE }),
  });

  // 폼의 연결 국가 선택용 — 전체 국가 한번에 로드 (size 큼)
  const { data: countryData } = useQuery({
    queryKey: ['countries-all-for-currency'],
    queryFn: () => countryApi.list({ page: 0, size: 500 }),
  });
  const allCountries = countryData?.content ?? [];

  const currencies = data?.content ?? [];

  const [editing, setEditing] = useState<CurrencyResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [currencyCode, setCurrencyCode] = useState('');
  const [nameKo, setNameKo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimalPlaces, setDecimalPlaces] = useState(0);
  const [countryId, setCountryId] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (editing) {
      setCurrencyCode(editing.currencyCode);
      setNameKo(editing.nameKo);
      setNameEn(editing.nameEn);
      setSymbol(editing.symbol);
      setDecimalPlaces(editing.decimalPlaces ?? 0);
      setCountryId(editing.countryId ?? '');
      setDisplayOrder(editing.displayOrder ?? 0);
      setActive(editing.active);
    } else {
      setCurrencyCode('');
      setNameKo('');
      setNameEn('');
      setSymbol('');
      setDecimalPlaces(0);
      setCountryId('');
      setDisplayOrder(0);
      setActive(true);
    }
  }, [editing]);

  const createMutation = useMutation({
    mutationFn: () =>
      currencyApi.create({
        currencyCode: currencyCode.trim().toUpperCase(),
        nameKo: nameKo.trim(),
        // API는 nameEn 필수. UI엔 없으므로 입력값(편집 시 서버값)이 있으면 쓰고, 없으면 nameKo로 폴백.
        nameEn: nameEn.trim() || nameKo.trim(),
        symbol: symbol.trim(),
        decimalPlaces,
        countryId: countryId || undefined,
        displayOrder,
        active,
      }),
    onSuccess: () => {
      toast.success('등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      currencyApi.update(editing!.id, {
        nameKo: nameKo.trim(),
        // API는 nameEn 필수. UI엔 없으므로 입력값(편집 시 서버값)이 있으면 쓰고, 없으면 nameKo로 폴백.
        nameEn: nameEn.trim() || nameKo.trim(),
        symbol: symbol.trim(),
        decimalPlaces,
        countryId: countryId || undefined,
        displayOrder,
        active,
      }),
    onSuccess: () => {
      toast.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '수정에 실패했습니다.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => currencyApi.remove(id),
    onSuccess: () => {
      toast.success('삭제되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '삭제에 실패했습니다.');
    },
  });

  const [deleteTarget, setDeleteTarget] = useState<CurrencyResponse | null>(null);

  const handleSave = () => {
    if (!editing && !currencyCode.trim()) {
      toast.error('통화 코드를 입력해주세요.');
      return;
    }
    if (!nameKo.trim() || !nameEn.trim()) {
      toast.error('한글명과 영문명을 모두 입력해주세요.');
      return;
    }
    if (!symbol.trim()) {
      toast.error('통화 기호를 입력해주세요.');
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
            통화 추가
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
                <AdminTableHead className="px-6 py-4">통화명</AdminTableHead>
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
              {!isLoading && !isError && currencies.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                    등록된 통화가 없습니다.
                  </td>
                </tr>
              )}
              {currencies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-[14px] font-medium text-gray-900">{c.nameKo}</span>
                    {!c.active && (
                      <span className="ml-2 text-[11px] font-[600] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                        비활성
                      </span>
                    )}
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
              {editing ? '통화 편집' : '통화 추가'}
            </h3>
            <div className="h-[1px] bg-gray-100 w-full" />
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  통화명 (ex. 원)
                </label>
                <Input
                  placeholder="통화명을 입력해주세요"
                  value={nameKo}
                  onChange={(e) => setNameKo(e.target.value)}
                  maxLength={100}
                  className="border-gray-200 h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  통화기호 (ex. ₩)
                </label>
                <Input
                  placeholder="통화기호를 입력해주세요"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  maxLength={10}
                  className="border-gray-200 h-11"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  통화코드 (ex. KRW)
                </label>
                <Input
                  placeholder="통화코드를 입력해주세요"
                  value={currencyCode}
                  onChange={(e) => setCurrencyCode(e.target.value)}
                  maxLength={5}
                  disabled={!!editing}
                  className={`border-gray-200 h-11 ${editing ? 'bg-gray-50 text-gray-500' : ''}`}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가 선택
                </label>
                <Select
                  value={countryId || COUNTRY_PICK_NONE}
                  onValueChange={(v) =>
                    setCountryId(v === COUNTRY_PICK_NONE ? '' : v)
                  }
                >
                  <SelectTrigger className="h-11 border-gray-200">
                    <SelectValue placeholder="국가를 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={COUNTRY_PICK_NONE}>없음</SelectItem>
                    {allCountries.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.nameKo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        title="통화를 삭제하시겠어요?"
        description={`삭제 시 "${deleteTarget?.nameKo}" 통화의 정보가 모두 제거됩니다.`}
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
