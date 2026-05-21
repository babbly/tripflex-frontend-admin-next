'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { GripVertical, Plus, X } from 'lucide-react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { EditButton, DeleteButton } from '@/components/ui/action-buttons';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  AdminTableHead,
  AdminTableHeaderRow,
} from '@/components/ui/admin-table';
import { currencyApi } from '@/lib/currency-api';
import { countryApi } from '@/lib/country-api';
import { countryCurrencyMappingApi } from '@/lib/country-currency-mapping-api';
import { CurrencyResponse } from '@/types/currency';
import { ApiError } from '@/types/api';
import { usePagePermission } from '@/hooks/use-page-permission';

const CURRENCY_CODE_PATTERN = /^[A-Z]{3}$/;

type CurrencyRowProps = {
  currency: CurrencyResponse;
  onEdit: (c: CurrencyResponse) => void;
  onDelete: (c: CurrencyResponse) => void;
  canWrite?: boolean;
  canDelete?: boolean;
};

function SortableCurrencyRow({ currency, onEdit, onDelete, canWrite = true, canDelete = true }: CurrencyRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: currency.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <tr
      ref={setNodeRef}
      style={style}
      className="hover:bg-gray-50 transition-colors bg-white"
    >
      <td className="px-4 py-4 w-[60px] text-center">
        {canWrite && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab text-gray-400 hover:text-gray-600 focus:outline-none"
            aria-label="순서 변경"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}
      </td>
      <td className="px-6 py-4">
        <span className="text-[14px] font-medium text-gray-900">
          {currency.nameKo}
        </span>
        {!currency.active && (
          <span className="ml-2 text-[11px] font-[600] px-2 py-0.5 rounded bg-gray-100 text-gray-500">
            비활성
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-end gap-2">
          {canWrite && <EditButton onClick={() => onEdit(currency)} />}
          {canDelete && <DeleteButton onClick={() => onDelete(currency)} />}
        </div>
      </td>
    </tr>
  );
}

export default function CurrencyTab() {
  const queryClient = useQueryClient();
  const { canWrite, canDelete } = usePagePermission('/countries');

  // 페이지네이션 제거 — 순서 변경 기능 추가 시 재도입.
  // const [page, setPage] = useState(0);
  // const [pageSize, setPageSize] = useState('10');
  // const size = parseInt(pageSize, 10);
  const FETCH_SIZE = 500;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['currencies'],
    queryFn: () => currencyApi.list({ page: 0, size: FETCH_SIZE }),
  });

  const { data: countryData } = useQuery({
    queryKey: ['countries-all-for-currency'],
    queryFn: () => countryApi.list({ page: 0, size: 500 }),
  });
  const allCountries = countryData?.content ?? [];

  const [localOrder, setLocalOrder] = useState<CurrencyResponse[] | null>(null);
  useEffect(() => {
    setLocalOrder(null);
  }, [data]);
  const currencies = localOrder ?? data?.content ?? [];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reorderMutation = useMutation({
    mutationFn: (items: { id: string; displayOrder: number }[]) =>
      currencyApi.updateSort(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '순서 변경에 실패했습니다.');
      setLocalOrder(null);
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = currencies.findIndex((c) => c.id === active.id);
    const newIndex = currencies.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(currencies, oldIndex, newIndex);
    setLocalOrder(reordered);
    reorderMutation.mutate(
      reordered.map((c, idx) => ({ id: c.id, displayOrder: idx })),
    );
  };

  const [editing, setEditing] = useState<CurrencyResponse | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [currencyCode, setCurrencyCode] = useState('');
  const [nameKo, setNameKo] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [symbol, setSymbol] = useState('');
  const [decimalPlaces, setDecimalPlaces] = useState(0);
  const [selectedCountryIds, setSelectedCountryIds] = useState<string[]>([]);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);

  const [nameKoError, setNameKoError] = useState('');
  const [symbolError, setSymbolError] = useState('');
  const [currencyCodeError, setCurrencyCodeError] = useState<string>('');
  const [countrySearch, setCountrySearch] = useState('');
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const countrySearchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editing) {
      setCurrencyCode(editing.currencyCode);
      setNameKo(editing.nameKo);
      setNameEn(editing.nameEn ?? '');
      setSymbol(editing.symbol);
      setDecimalPlaces(editing.decimalPlaces ?? 0);
      setSelectedCountryIds(editing.countryIds ?? []);
      setDisplayOrder(editing.displayOrder ?? 0);
      setActive(editing.active);
    } else {
      setCurrencyCode('');
      setNameKo('');
      setNameEn('');
      setSymbol('');
      setDecimalPlaces(0);
      setSelectedCountryIds([]);
      setDisplayOrder(0);
      setActive(true);
    }
    setNameKoError('');
    setSymbolError('');
    setCurrencyCodeError('');
    setCountrySearch('');
    setCountryDropdownOpen(false);
  }, [editing]);

  const syncMappings = async (
    currencyId: string,
    nextCountryIds: string[],
    prevCountryIds: string[],
  ) => {
    const toAdd = nextCountryIds.filter((id) => !prevCountryIds.includes(id));
    const toRemove = prevCountryIds.filter((id) => !nextCountryIds.includes(id));

    if (toRemove.length > 0) {
      const mappings = await countryCurrencyMappingApi.list({ currencyId });
      const removeIds = mappings
        .filter((m) => toRemove.includes(m.countryId))
        .map((m) => m.id);
      await Promise.all(removeIds.map((id) => countryCurrencyMappingApi.remove(id)));
    }
    await Promise.all(
      toAdd.map((countryId) =>
        countryCurrencyMappingApi.create({ countryId, currencyId }),
      ),
    );
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const created = await currencyApi.create({
        currencyCode: currencyCode.trim().toUpperCase(),
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim() || undefined,
        symbol: symbol.trim(),
        decimalPlaces,
        displayOrder,
        active,
      });
      if (selectedCountryIds.length > 0) {
        await syncMappings(created.id, selectedCountryIds, []);
      }
      return created;
    },
    onSuccess: () => {
      toast.success('등록되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
      setShowForm(false);
      setEditing(null);
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : '등록에 실패했습니다.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const updated = await currencyApi.update(editing!.id, {
        nameKo: nameKo.trim(),
        nameEn: nameEn.trim() || undefined,
        symbol: symbol.trim(),
        decimalPlaces,
        displayOrder,
        active,
      });
      await syncMappings(
        editing!.id,
        selectedCountryIds,
        editing!.countryIds ?? [],
      );
      return updated;
    },
    onSuccess: () => {
      toast.success('수정되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['currencies'] });
      queryClient.invalidateQueries({ queryKey: ['countries'] });
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
    let valid = true;
    if (!nameKo.trim()) {
      setNameKoError('통화명을 입력해주세요.');
      valid = false;
    } else {
      setNameKoError('');
    }
    if (!symbol.trim()) {
      setSymbolError('통화 기호를 입력해주세요.');
      valid = false;
    } else {
      setSymbolError('');
    }
    if (!currencyCode) {
      setCurrencyCodeError('통화코드를 입력해주세요.');
      valid = false;
    } else if (!CURRENCY_CODE_PATTERN.test(currencyCode)) {
      setCurrencyCodeError('올바른 통화코드를 입력해주세요.');
      valid = false;
    } else {
      setCurrencyCodeError('');
    }
    if (!valid) return;
    if (editing) updateMutation.mutate();
    else createMutation.mutate();
  };

  return (
    <div className="flex gap-6">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-end">
          {!showForm && canWrite && (
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
          )}
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full text-left border-collapse">
              <thead>
                <AdminTableHeaderRow>
                  <AdminTableHead className="px-4 py-4 w-[60px] text-center">
                    순서
                  </AdminTableHead>
                  <AdminTableHead className="px-6 py-4">통화명</AdminTableHead>
                  <AdminTableHead className="px-6 py-4 text-right w-[120px]">
                    관리
                  </AdminTableHead>
                </AdminTableHeaderRow>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                      불러오는 중...
                    </td>
                  </tr>
                )}
                {isError && !isLoading && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-red-500">
                      {error instanceof ApiError ? error.message : '목록을 불러오지 못했습니다.'}
                    </td>
                  </tr>
                )}
                {!isLoading && !isError && currencies.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">
                      등록된 통화가 없습니다.
                    </td>
                  </tr>
                )}
                <SortableContext
                  items={currencies.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {currencies.map((c) => (
                    <SortableCurrencyRow
                      key={c.id}
                      currency={c}
                      onEdit={(target) => {
                        setEditing(target);
                        setShowForm(true);
                      }}
                      onDelete={(target) => setDeleteTarget(target)}
                      canWrite={canWrite}
                      canDelete={canDelete}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </DndContext>
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

      <div className={`transition-all duration-300 overflow-hidden shrink-0 ${showForm ? 'w-[360px]' : 'w-0'}`}>
        <div className="w-[360px] flex flex-col gap-4">
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
                  onChange={(e) => { setNameKo(e.target.value); if (nameKoError) setNameKoError(''); }}
                  maxLength={100}
                  className={`border-gray-200 h-11 ${nameKoError ? 'border-red-400' : ''}`}
                />
                {nameKoError && <p className="text-[12px] text-red-500">{nameKoError}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  통화기호 (ex. ₩)
                </label>
                <Input
                  placeholder="통화기호를 입력해주세요"
                  value={symbol}
                  onChange={(e) => { setSymbol(e.target.value); if (symbolError) setSymbolError(''); }}
                  maxLength={10}
                  className={`border-gray-200 h-11 ${symbolError ? 'border-red-400' : ''}`}
                />
                {symbolError && <p className="text-[12px] text-red-500">{symbolError}</p>}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  통화코드 (ex. KRW)
                </label>
                <Input
                  placeholder="통화코드를 입력해주세요"
                  value={currencyCode}
                  onChange={(e) => {
                    setCurrencyCode(e.target.value.toUpperCase().slice(0, 3));
                    if (currencyCodeError) setCurrencyCodeError('');
                  }}
                  maxLength={3}
                  className={`border-gray-200 h-11 ${currencyCodeError ? 'border-red-400' : ''}`}
                />
                {currencyCodeError && (
                  <p className="text-[12px] text-red-500">{currencyCodeError}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[14px] font-semibold text-gray-900">
                  국가 선택 (다중선택)
                </label>
                <div ref={countrySearchRef} className="relative">
                  <div
                    className={`flex flex-wrap gap-1.5 min-h-[44px] px-3 py-2 border rounded-md bg-white cursor-text transition-colors ${countryDropdownOpen ? 'border-[#4186FF] ring-1 ring-[#4186FF]' : 'border-gray-200'}`}
                    onClick={() => {
                      const input = countrySearchRef.current?.querySelector('input');
                      input?.focus();
                    }}
                  >
                    {selectedCountryIds.map((id) => {
                      const country = allCountries.find((c) => c.id === id);
                      if (!country) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EEF1FF] text-[#4186FF] text-[12px] font-medium rounded-full self-center"
                        >
                          {country.nameKo}
                          <button
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() =>
                              setSelectedCountryIds((prev) => prev.filter((i) => i !== id))
                            }
                            className="hover:opacity-70 transition-opacity"
                            aria-label={`${country.nameKo} 제거`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      );
                    })}
                    <input
                      type="text"
                      value={countrySearch}
                      onChange={(e) => {
                        setCountrySearch(e.target.value);
                        setCountryDropdownOpen(true);
                      }}
                      onFocus={() => setCountryDropdownOpen(true)}
                      onBlur={() => setTimeout(() => setCountryDropdownOpen(false), 150)}
                      placeholder={selectedCountryIds.length === 0 ? '국가명을 검색하여 선택해주세요' : ''}
                      className="flex-1 min-w-[120px] text-[13px] text-gray-700 placeholder:text-gray-400 outline-none bg-transparent self-center"
                    />
                  </div>
                  {countryDropdownOpen && (
                    <div className="absolute z-10 top-[calc(100%+4px)] left-0 right-0 bg-white border border-gray-200 rounded-md shadow-md max-h-[180px] overflow-y-auto">
                      {(() => {
                        const filtered = allCountries.filter(
                          (c) =>
                            !selectedCountryIds.includes(c.id) &&
                            (countrySearch.trim() === '' ||
                              c.nameKo.includes(countrySearch.trim()) ||
                              c.nameEn.toLowerCase().includes(countrySearch.trim().toLowerCase())),
                        );
                        if (filtered.length === 0) {
                          return (
                            <p className="px-3 py-2 text-[12px] text-gray-400">
                              {allCountries.length === 0 ? '등록된 국가가 없습니다.' : '검색 결과가 없습니다.'}
                            </p>
                          );
                        }
                        return filtered.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setSelectedCountryIds((prev) => [...prev, c.id]);
                              setCountrySearch('');
                            }}
                            className="w-full text-left px-3 py-2 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            {c.nameKo}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
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
      </div>

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
